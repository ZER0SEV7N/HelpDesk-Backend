import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';

@WebSocketGateway()
export class ChatGateway {
  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }
}
  //======================================================================================
  // MÉTODO PRIVADO: Enviar la lista de usuarios en línea
  //======================================================================================
  private broadcastOnlineUsers() {
    const usersArray = Array.from(this.onlineUsers.entries()).map(([id, username]) => ({
      idUser: id,
      username,
    }));
    this.server.emit('onlineUsers', usersArray);
  }
  //======================================================================================
  // MÉTODO PRIVADO: Enviar un mensaje al cliente
  //======================================================================================
  private sendMessage(client: any, message: string) {
    client.emit('message', message);
  }
  //======================================================================================
  // EVENTO: editMessage
  // WebSocket: Editar un mensaje existente
  //======================================================================================
  @SubscribeMessage('editMessage')
  async handleEditMessage(@MessageBody() payload: UpdateChatDto, @ConnectedSocket() client: Socket) {
    try {
      const message = await this.messageService.findOne(Number(payload.idMessage));
      if (!message) {
        client.emit('error', { message: 'Mensaje no encontrado' });
        return;
      }
      
      if (message.user.idUser !== client.data.idUser) {
        client.emit('error', { message: 'No puedes editar mensajes de otros usuarios' });
       return;
      }
      
      const updated = await this.messageService.updateMessage(
        Number(payload.idMessage),
        payload.newText,
      );
      
      const room = `Canal:${message.channel.idChannel}`;
      this.server.to(room).emit('messageEdited', updated);
      
      console.log(`✏️ Mensaje editado (ID: ${payload.idMessage})`);
    } catch (err) {
      console.error('Error editando mensaje:', err.message);
      client.emit('error', { message: 'Error al editar el mensaje' });
    }
  }