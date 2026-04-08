//helpDesk-Backend/src/chat/chat.gateway.ts
//Gateway para el chat en tiempo real usando WebSockets (Socket.IO)
//FUNCIONALIDADES:
//1. Manejo de conexión con Cookies HttpOnly para autenticación segura
//2. Lógica de Asignación Automática de Soporte (Balanceada entre técnicos disponibles)
//3. Unirse a un chat existente (Para técnicos o clientes que ya tienen ticket)
//4. Envío de mensajes en tiempo real dentro de la sala del ticket
import { 
  WebSocketGateway, 
  SubscribeMessage, 
  MessageBody, 
  ConnectedSocket, 
  WebSocketServer,
  OnGatewayConnection, 
  OnGatewayDisconnect 
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as cookie from 'cookie';
import { AuthService } from '../auth/auth.service'; 
import { TicketService } from '../ticket/ticket.service'; 
import { UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from '../entities/Usuario.entity';
import { ChatService } from './chat.service';
import { Repository } from 'typeorm';
import { env } from 'process';

@WebSocketGateway({
  cors: {
    origin: env.HTTP_ORIGIN || 'http://localhost:3000', 
    credentials: true,
  },
})

//ChatGateway implementa las interfaces para manejar conexiones y desconexiones
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;
  private logger = new Logger('ChatGateway');

  //Constructor
  constructor(
    private readonly authService: AuthService,
    private readonly ticketService: TicketService,
    private readonly chatService: ChatService,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) {}

  // 1. Manejo de conexión con Cookies HttpOnly
  async handleConnection(client: Socket) {
    try {
      const rawCookies = client.handshake.headers.cookie;
      if (!rawCookies) throw new UnauthorizedException('No hay cookies');

      const parsedCookies = cookie.parse(rawCookies);
      const token = parsedCookies['jwt']; // Verifica que este nombre coincida con tu login

      if (!token) throw new UnauthorizedException('Token no encontrado');

      const payload = await this.authService.verifyToken(token); 
      
      if (payload.clienteId) {
          client.join(`empresa_${payload.clienteId}`); 
      }
      client.join(`user_${payload.sub}`);

      //Guardamos la info del usuario en el socket
      //Estructura: { sub: id_usuario, role: string, email: string }
      client.data.user = payload; 
      
      this.logger.log(`Conectado: ${payload.role} - ID: ${payload.sub}`);
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`Conexión rechazada: ${mensaje}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  // 2. Lógica de Asignación Automática de Soporte
  @SubscribeMessage('request_assignment')
  async handleRequestAssignment(
    @MessageBody() data: { ticketId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;

    // Solo los trabajadores pueden solicitar asignación
    if (user.role !== 'CLIENTE_TRABAJADOR' && user.role !== 'CLIENTE_SUCURSAL') {
      return { status: 'error', message: 'No autorizado para solicitar asignación' };
    }

    // Buscamos al técnico con menos tickets asignados (Asignación Balanceada)
    // Nota: 'ticketsAsignados' debe ser la relación OneToMany en tu entidad Usuario
    const bestAgent = await this.usuarioRepo
      .createQueryBuilder('u')
      .leftJoin('u.tickets_soporte', 't', 't.estado IN (:...estados)', { estados: ['Pendiente', 'Asignado', 'En Progreso'] }) 
      .leftJoin('u.rol', 'r') 
      .select('u.id_usuario', 'id')
      .addSelect('u.nombre', 'nombre')
      .addSelect('COUNT(t.id_ticket)', 'totalTickets')
      .where('r.nombre = :rol', { rol: 'SOPORTE_REMOTO' }) // Rol oficial
      .andWhere('u.is_active = :active', { active: true })
      .groupBy('u.id_usuario')
      .addGroupBy('u.nombre')
      .orderBy('totalTickets', 'ASC')
      .getRawOne();

    if (!bestAgent) {
      return { status: 'error', message: 'No hay agentes disponibles' };
    }

    // Simulamos el objeto 'user' que ellos piden en sus argumentos
    const authUser = { userId: user.sub, role: 'ADMINISTRADOR' }; 
    await this.ticketService.assignTicket(data.ticketId, bestAgent.id, authUser);

    // Unimos al cliente a la sala del ticket
    client.join(data.ticketId.toString());

    // Avisamos a todos en el sistema que el ticket fue asignado
    this.server.emit('ticket_assigned', {
      ticketId: data.ticketId,
      agentId: bestAgent.id,
      agentName: bestAgent.nombre
    });

    return { status: 'assigned', agent: bestAgent.nombre };
  }

  // 3. Unirse a un chat existente (Para técnicos o clientes que ya tienen ticket)
  @SubscribeMessage('join_ticket')
  async handleJoinTicket(
    @MessageBody() data: { ticketId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;
    try {
      const ticket = await this.ticketService.getTicketById(Number(data.ticketId), user);
      
      // Permitimos unirse al creador, al técnico asignado o al Admin
      if (ticket.id_cliente === user.sub || ticket.id_soporte === user.sub || user.role === 'ADMINISTRADOR') {
        client.join(data.ticketId.toString());
        this.logger.log(`Usuario ${user.sub} se unió al chat del ticket: ${data.ticketId}`);
        return { event: 'joined', room: data.ticketId };
      } else {
        return { event: 'error', message: 'Acceso denegado a este chat' };
      }
    } catch (error) {
      return { event: 'error', message: 'Ticket no encontrado o inaccesible' };
    }
  }

  // 4. Envío de mensajes en tiempo real
  @SubscribeMessage('send_message')
  async handleMessage(
    @MessageBody() data: { ticketId: string, content: string },
    @ConnectedSocket() client: Socket,
  ) {
   const user = client.data.user;

    // Preparamos el objeto para MongoDB basándonos en tu DTO
    const messagePayload = {
      ticketId: Number(data.ticketId),
      userId: user.sub,
      contenido: data.content,
      // No mandamos timestamp, Mongoose maneja el createdAt automáticamente si lo definiste en el schema
    };

    // 1. Emitir el mensaje inmediatamente a la sala (Velocidad en tiempo real)
    this.server.to(data.ticketId.toString()).emit('new_message', {
      ...messagePayload,
      createdAt: new Date() // Solo para el frontend visual
    });
    
    // 2. Persistir en la base de datos (Mongo) y caché (Redis)
    try {
      await this.chatService.guardarMensaje(messagePayload as any);
    } catch (error : any) {
      this.logger.error(`Fallo al guardar mensaje del ticket ${data.ticketId}: ${error.message}`);
    }
  }
}
