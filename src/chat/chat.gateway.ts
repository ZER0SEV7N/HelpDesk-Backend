//helpdesk-backend/src/chat/chat.gateway.ts
//Modulo para el websocket del chat
//Funcionalidades principales:
//1. Escuchar mensajes entrantes del cliente
//2. Procesar los mensajes y responder al cliente
//3. Integrar con la base de datos para almacenar mensajes (opcional)
//4. Manejar eventos de conexión y desconexión de clientes
//Importaciones necesarias:
import { SubscribeMessage, WebSocketGateway, 
  MessageBody, ConnectedSocket, 
WebSocketServer, OnGatewayConnection } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
/*
@WebSocketGateway({ cors: { origin: '*' } }) //Permitir conexiones desde cualquier origen
/*
export class ChatGateway implements OnGatewayConnection {
  @WebSocketGateway

  constructor(private readonly chatService: ChatService) {}

  @SubscribeMessage('createChat')
  create(@MessageBody() createChatDto: CreateChatDto) {
    return this.chatService.create(createChatDto);
  }

  @SubscribeMessage('findAllChat')
  findAll() {
    return this.chatService.findAll();
  }

  @SubscribeMessage('findOneChat')
  findOne(@MessageBody() id: number) {
    return this.chatService.findOne(id);
  }

  @SubscribeMessage('updateChat')
  update(@MessageBody() updateChatDto: UpdateChatDto) {
    return this.chatService.update(updateChatDto.id, updateChatDto);
  }

  @SubscribeMessage('removeChat')
  remove(@MessageBody() id: number) {
    return this.chatService.remove(id);
  }*/

