import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as cookie from 'cookie';
import { AuthService } from '../../modules/auth/auth.service';
import { TicketService } from '../../ticket/ticket.service';
import { UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from '../../entities/Usuario.entity';
import { ChatService } from './chat.service';
import { Repository } from 'typeorm';
import { env } from 'process';
import { JwtPayload } from '../guards/jwt-auth.guard';

interface AssignmentData {
  ticketId: number;
}

interface JoinTicketData {
  ticketId: string;
}

interface MessageData {
  ticketId: string;
  content: string;
  type?: string;
  fileUrl?: string;
}

interface ReadData {
  ticketId: string;
  lastMessageId: string;
}

@WebSocketGateway({
  cors: {
    origin: env.HTTP_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;
  private logger = new Logger('ChatGateway');

  constructor(
    private readonly authService: AuthService,
    private readonly ticketService: TicketService,
    private readonly chatService: ChatService,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const rawCookies = client.handshake.headers.cookie;
      if (!rawCookies) throw new UnauthorizedException('No hay cookies');

      const parsedCookies = cookie.parse(rawCookies);
      const token = parsedCookies['jwt'];

      if (!token) throw new UnauthorizedException('Token no encontrado');

      const payload = (await this.authService.verifyToken(token)) as JwtPayload;

      if (payload.clienteId) client.join(`empresa_${payload.clienteId}`);
      client.join(`user_${payload.sub}`);

      client.data.user = payload;
      this.logger.log(`Conectado: ${payload.role} - ID: ${payload.sub}`);
    } catch (error) {
      const mensaje =
        error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`Conexión rechazada: ${mensaje}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  @SubscribeMessage('request_assignment')
  async handleRequestAssignment(
    @MessageBody() data: AssignmentData,
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user as JwtPayload;

    if (
      !['CLIENTE_TRABAJADOR', 'CLIENTE_SUCURSAL', 'CLIENTE_EMPRESA'].includes(
        user.role,
      )
    )
      return {
        status: 'error',
        message: 'No autorizado para solicitar asignación',
      };

    const bestAgent = await this.usuarioRepo
      .createQueryBuilder('u')
      .leftJoin('u.tickets_soporte', 't', 't.estado IN (:...estados)', {
        estados: ['Pendiente', 'Asignado', 'En Progreso'],
      })
      .leftJoin('u.rol', 'r')
      .select('u.id_usuario', 'id')
      .addSelect('u.nombre', 'nombre')
      .addSelect('COUNT(t.id_ticket)', 'totalTickets')
      .where('r.nombre IN (:...roles)', { roles: ['SOPORTE_TECNICO', 'SOPORTE_INSITU'] })
      .andWhere('u.is_active = :active', { active: true })
      .groupBy('u.id_usuario')
      .addGroupBy('u.nombre')
      .orderBy('totalTickets', 'ASC')
      .getRawOne();

    if (!bestAgent)
      return { status: 'error', message: 'No hay agentes disponibles' };

    const authUser = {
      sub: user.sub,
      userId: user.sub,
      role: 'ADMINISTRADOR' as const,
    };
    await this.ticketService.assignTicket(
      data.ticketId,
      bestAgent.id,
      authUser,
    );

    client.join(data.ticketId.toString());

    this.server.emit('ticket_assigned', {
      ticketId: data.ticketId,
      agentId: bestAgent.id,
      agentName: bestAgent.nombre,
    });

    return { status: 'assigned', agent: bestAgent.nombre };
  }

  @SubscribeMessage('join_ticket')
  async handleJoinTicket(
    @MessageBody() data: JoinTicketData,
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user as JwtPayload;
    try {
      const ticket = await this.ticketService.getTicketById(
        Number(data.ticketId),
        user,
      );

      const isCreator = ticket.id_trabajador === user.sub;
      const isAssignedTech = ticket.id_soporte === user.sub;
      const isManagerOrAdmin = [
        'ADMINISTRADOR',
        'CLIENTE_EMPRESA',
        'CLIENTE_SUCURSAL',
      ].includes(user.role);

      if (isCreator || isAssignedTech || isManagerOrAdmin) {
        client.join(data.ticketId.toString());
        this.logger.log(
          `Usuario ${user.sub} se unió al chat del ticket: ${data.ticketId}`,
        );
        return { event: 'joined', room: data.ticketId };
      } else {
        return { event: 'error', message: 'Acceso denegado a este chat' };
      }
    } catch {
      return { event: 'error', message: 'Ticket no encontrado o inaccesible' };
    }
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @MessageBody()
    data: MessageData,
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user as JwtPayload;

    const messagePayload = {
      ticketId: Number(data.ticketId),
      userId: user.sub,
      contenido: data.content,
      tipo: data.type || 'TEXTO',
      url_archivo: data.fileUrl || null,
    };

    client.broadcast.to(data.ticketId.toString()).emit('new_message', {
      ...messagePayload,
      createdAt: new Date(),
    });

    try {
      await this.chatService.guardarMensaje(messagePayload);
    } catch (error) {
      const mensaje =
        error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(
        `Fallo al guardar mensaje del ticket ${data.ticketId}: ${mensaje}`,
      );
    }
  }

  @SubscribeMessage('typing_start')
  handleTypingStart(
    @MessageBody() data: JoinTicketData,
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user as JwtPayload;
    client.broadcast.to(data.ticketId.toString()).emit('user_typing', {
      userId: user.sub,
      nombre: user.nombre || 'Alguien',
    });
  }

  @SubscribeMessage('typing_end')
  handleTypingEnd(
    @MessageBody() data: JoinTicketData,
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user as JwtPayload;
    client.broadcast.to(data.ticketId.toString()).emit('user_stopped_typing', {
      userId: user.sub,
    });
  }

  notifyTicketResolved(ticketId: number) {
    this.server.to(ticketId.toString()).emit('ticket_resolved', { ticketId });
  }

  handleMarkAsRead(data: ReadData) {
    this.server.to(data.ticketId.toString()).emit('messages_read', {
      userId: (this.server.sockets as unknown as Record<string, Socket>)?.[
        data.ticketId
      ]?.data?.user?.sub,
      lastMessageId: data.lastMessageId,
    });
  }
}
