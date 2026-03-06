//helpdesk-backend/src/chat/chat.service.ts
//Modulo para el servicio del chat
//Funcionalidades principales:
//1. Gestionar la lógica de negocio relacionada con el chat
//2. Interactuar con la base de datos para almacenar y recuperar mensajes
//3. Proporcionar métodos para crear, actualizar y eliminar mensajes
//4. Integrar con el ChatGateway para enviar mensajes a los clientes conectados

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mensaje } from 'src/entities/Mensajes.entity';
import { Ticket } from 'src/entities/Tickets.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Mensaje)
    private readonly mensajeRepo: Repository<Mensaje>,
    @InjectRepository(Ticket)
    private readonly ticketRepo: Repository<Ticket>,
  ) {}

  //Guardar un nuevo mensaje en la base de datos
  async saveMessage(payload: { id_ticket: number; senderId: number; content: string; fileUrl?: string }) {
    const { id_ticket, senderId, content, fileUrl } = payload;

    const newMessage = this.mensajeRepo.create({
      contenido: content,
      adjunto: fileUrl,
      ticket: { id_ticket: id_ticket },
      usuario: { id_usuario: senderId },
    })

    return await this.mensajeRepo.save(newMessage);
  }

  //Obtener el historial de mensajes de un ticket
  async getMessagesByTicket(id_ticket: number) {
    return await this.mensajeRepo.find({
      where: { ticket: { id_ticket} },
      relations: ['usuario'], //Incluir información del usuario que envió cada mensaje
      order: { fechaCreacion: 'ASC' }, //Ordenar por fecha de creación
    });
  }

  //Marcar un mensaje como leido
  async markMessageAsRead(ticketId: number, userId: number) {
    await this.mensajeRepo.createQueryBuilder()
      .update(Mensaje)
      .set({ leido: new Date() })
      .where("ticket.id_ticket = :ticketId", { ticketId })
      .andWhere("usuario.id_usuario != :userId", { userId }) //Solo marcar como leido los mensajes que no fueron enviados por el usuario actual
      .andWhere("leido IS NULL") //Solo marcar como leido los mensajes que no han sido leidos previamente
      .execute();
    return { success: true };
  }

}
