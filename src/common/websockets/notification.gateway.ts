//src/common/websockets/notification.gateway.ts
//Gateway para notificaciones en tiempo real usando WebSockets (Socket.IO)
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import * as cookie from 'cookie';
import { AuthService } from '../../modules/auth/auth.service';
import { env } from 'process';
import { JwtPayload } from '../guards/jwt-auth.guard';

@WebSocketGateway({
  namespace: '/notifications',
  cors: {
    origin: env.HTTP_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;
  private logger = new Logger('NotificationGateway');

  constructor(private readonly authService: AuthService) {}

  async handleConnection(client: Socket) {
    try {
      const rawCookies = client.handshake.headers.cookie;
      if (!rawCookies) return client.disconnect();

      const parsedCookies = cookie.parse(rawCookies);
      const token = parsedCookies['jwt'];
      if (!token) return client.disconnect();

      const payload = (await this.authService.verifyToken(token)) as JwtPayload;
      client.data.user = payload;

      client.join(`admin_user_${payload.sub}`);

      this.logger.log(`Usuario conectado a Notificaciones: ID ${payload.sub}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error al conectar usuario a Notificaciones: ${message}`,
      );
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Usuario desconectado de Notificaciones: ${client.id}`);
  }

  emitEmailVerificationStatus(
    userId: number,
    data: {
      correo: string;
      verificado: boolean;
      expirado?: boolean;
      status?: string;
    },
  ) {
    this.server
      .to(`admin_user_${userId}`)
      .emit('email_verification_status', data);
  }
}
