import { 
  SubscribeMessage, 
  WebSocketGateway, 
  WebSocketServer, 
  OnGatewayConnection, 
  OnGatewayDisconnect 
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } }) // Habilitamos CORS para evitar bloqueos
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;

  // 2. Declaramos el Map para guardar los usuarios (ID de socket -> Nombre de usuario)
  private onlineUsers: Map<string, string> = new Map();

  // Se ejecuta cuando alguien se conecta
  handleConnection(client: Socket) {
    console.log(`Cliente conectado: ${client.id}`);
  // Ejemplo: Guardamos al usuario temporalmente con su ID como nombre
    this.onlineUsers.set(client.id, `Usuario-${client.id.substring(0, 4)}`);
    this.broadcastOnlineUsers();
  }

  // Se ejecuta cuando alguien se desconecta
  handleDisconnect(client: Socket) {
    console.log(`Cliente desconectado: ${client.id}`);
    this.onlineUsers.delete(client.id);
    this.broadcastOnlineUsers();
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: any): string {
    return 'Hello world!';
  }

  private broadcastOnlineUsers() {
    // 1. Transformamos el Map a un formato de array de objetos legible
    const usersArray = Array.from(this.onlineUsers.entries()).map(([id, username]) => ({
      idUser: id,
      username,
    }));

    // 2. Visualización en la terminal del servidor
    console.log(`\n[Socket.io] Actualizando lista: ${usersArray.length} usuarios activos.`);
    if (usersArray.length > 0) {
      console.table(usersArray); 
    }

    // 3. Emitimos la lista a todos los clientes conectados usando el server declarado
    this.server.emit('onlineUsers', usersArray);
  }

    // 4. ENVIAR MENSAJE
    @SubscribeMessage('chatMessage')
    handleChatMessage(client: Socket, payload: { message: string }) {
      const username = this.onlineUsers.get(client.id) || 'Anónimo';

      const messageData = {
        from: username,
        message: payload.message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

    // Enviamos el mensaje a todos los conectados
      this.server.emit('newMessage', messageData);
      console.log(`[Chat] ${username}: ${payload.message}`);
  }
}