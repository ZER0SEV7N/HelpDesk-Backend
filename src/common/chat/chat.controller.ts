// Helpdesk-app/src/chat/chat.controller.ts
<<<<<<< HEAD
import { Controller, Get, Param, ParseIntPipe, UseGuards, Req, ForbiddenException, NotFoundException } from '@nestjs/common';
=======
import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
>>>>>>> origin/leandro
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RoleGuard } from '../guards/role.guard';
import { Roles } from '../decorators/role.decorator';
import { Request } from 'express';
import { TicketService } from '../../ticket/ticket.service';
import { JwtPayload } from '../guards/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard, RoleGuard)
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly ticketService: TicketService,
  ) {}

  @Get('historial/:ticketId')
  @Roles(
    'ADMINISTRADOR',
    'CLIENTE_EMPRESA',
    'CLIENTE_SUCURSAL',
    'CLIENTE_TRABAJADOR',
    'SOPORTE_TECNICO',
    'SOPORTE_INSITU',
  )
  async obtenerHistorial(
    @Param('ticketId', ParseIntPipe) ticketId: number,
    @Req() req: Request & { user: JwtPayload },
  ) {
    const ticket = await this.ticketService.getTicketById(ticketId, req.user);
    const isAdmin = req.user.role === 'ADMINISTRADOR';
    const isAssignedTech = ticket.id_soporte === req.user.sub;
    const isCreator = ticket.id_trabajador === req.user.sub;

    if (!isAdmin && !isAssignedTech && !isCreator) {
      throw new ForbiddenException('Acceso denegado a este chat');
    }

    return await this.chatService.obtenerHistorialCompleto(ticketId);
  }
}
