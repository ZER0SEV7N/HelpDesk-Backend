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
import { TicketService } from '../ticket/ticket.service'; // Asegúrate de que la ruta coincida
import { UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from '../entities/Usuario.entity';
import { Repository } from 'typeorm';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000', // URL de tu Frontend
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly authService: AuthService,
    private readonly ticketService: TicketService,
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
      
      // Guardamos la info del usuario en el socket
      // Estructura: { sub: id_usuario, role: string, email: string }
      client.data.user = payload; 
      
      console.log(`Conectado: ${payload.role} - ID: ${payload.sub}`);
    } catch (error) {
      console.log(`Conexión rechazada: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Cliente desconectado: ${client.id}`);
  }

  // 2. Lógica de Asignación Automática de Soporte
  @SubscribeMessage('request_assignment')
  async handleRequestAssignment(
    @MessageBody() data: { ticketId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;

    // Solo los trabajadores pueden solicitar asignación
    if (user.role !== 'TRABAJADOR') return { error: 'No autorizado' };

    // Buscamos al técnico con menos tickets asignados (Asignación Balanceada)
    // Nota: 'ticketsAsignados' debe ser la relación OneToMany en tu entidad Usuario
    const bestAgent = await this.usuarioRepo
      .createQueryBuilder('u')
      .leftJoin('u.ticketsAsignados', 't') 
      .select('u.id_usuario', 'id')
      .addSelect('u.nombre', 'nombre')
      .addSelect('COUNT(t.id_ticket)', 'totalTickets')
      .where('u.rol.nombre = :rol', { rol: 'SOPORTE_TECNICO' }) // Filtramos por el rol de tus compañeros
      .andWhere('u.is_active = :active', { active: true })
      .groupBy('u.id_usuario')
      .addGroupBy('u.nombre')
      .orderBy('totalTickets', 'ASC')
      .getRawOne();

    if (!bestAgent) {
      return { status: 'error', message: 'No hay agentes disponibles' };
    }

    // Usamos el método de tus compañeros para actualizar la BD
    // Simulamos el objeto 'user' que ellos piden en sus argumentos
    const authUser = { userId: user.sub, role: 'SOPORTE_TECNICO' }; 
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
  handleJoinTicket(
    @MessageBody() data: { ticketId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.ticketId);
    console.log(`Usuario unido a la sala: ${data.ticketId}`);
    return { event: 'joined', room: data.ticketId };
  }

  // 4. Envío de mensajes en tiempo real
  @SubscribeMessage('send_message')
  async handleMessage(
    @MessageBody() data: { ticketId: string, content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const messagePayload = {
      content: data.content,
      senderId: client.data.user.sub,
      role: client.data.user.role,
      timestamp: new Date(),
    };

    // Emitir a todos en la sala (incluyendo al remitente para confirmación visual)
    this.server.to(data.ticketId).emit('new_message', messagePayload);
    
    // Aquí puedes llamar a un chatService.save() si decides guardar el historial después
  }
}