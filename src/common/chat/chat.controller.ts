// Helpdesk-app/src/chat/chat.controller.ts
import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('historial/:ticketId')
  async obtenerHistorial(@Param('ticketId', ParseIntPipe) ticketId: number) {
    return await this.chatService.obtenerHistorialCompleto(ticketId);
  }
}