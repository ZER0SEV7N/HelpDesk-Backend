//src/common/websockets/notification.gateway.ts
//Gateway para notificaciones en tiempo real usando WebSockets (Socket.IO)
import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import * as cookie from 'cookie';
import { AuthService } from '../../modules/auth/auth.service';
import { env } from 'process';

//NotificationGateway implementa las interfaces para manejar conexiones y desconexiones
@WebSocketGateway({
  namespace: '/notifications', 
  cors: {
    origin: env.HTTP_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server!: Server; //Instancia del servidor WebSocket
    private logger = new Logger('NotificationGateway'); //Instancia del logger para registrar eventos

    constructor(private readonly authService: AuthService) {}

    //Manejo de conexión
    async handleConnection(client: Socket) {
        try{
            const rawCookies = client.handshake.headers.cookie;
            if(!rawCookies) return client.disconnect(); //Desconectar si no hay cookies

            const parsedCookies = cookie.parse(rawCookies);
            const token = parsedCookies['jwt']; // Verifica que este nombre coincida con tu login
            if(!token) return client.disconnect(); //Desconectar si no hay token

            const payload = await this.authService.verifyToken(token);
            client.data.use = payload;

            client.join(`admin_user_${payload.sub}`); //Unirse a la sala del usuario

           this.logger.log(`Usuario conectado a Notificaciones: ID ${payload.sub}`);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error al conectar usuario a Notificaciones: ${message}`);
            client.disconnect();
        }
    }

    //Manejo de desconexión
    handleDisconnect(client: Socket) {
        this.logger.log(`Usuario desconectado de Notificaciones: ${client.id}`);
    }

    //Método público invocable desde cualquier Service o Manager del Backend
    emitEmailVerificationStatus(userId: number, data: { correo: string; verificado: boolean; expirado?: boolean; status?: string }) {
        this.server.to(`admin_user_${userId}`).emit('email_verification_status', data);
    }
}