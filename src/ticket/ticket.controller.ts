//src/ticket/ticket.controller.ts
//Modulo de controlador para la tabla ticket
//importaciones necesarias:
import { Controller, Get, Post, Body, Patch, Param, Query, Req, UseGuards, Delete } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/auth/decorators/role.decorator';
import { UpdateTicketDto } from './dto/update-ticket.dto';

@Controller('ticket')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  //Endpoint para crear un nuevo ticket
  //POST /ticket/CrearTicket
  //El cliente envia el {
  //asunto, 
  //detalle, 
  //id_equipo, 
  //id_software (opcional), 
  //es_software (booleano para indicar si el problema es de software o hardware) 
  //y una imagen (opcional)
  //}
  @Post()
  @Roles('TRABAJADOR')
  @UseGuards(JwtAuthGuard, RoleGuard)
  create(@Body() dto: CreateTicketDto, @Req() req: any) {
    return this.ticketService.createTicket(dto, req.user);
  }

  //Endpoint para listar los tickets del cliente autenticado
  //GET /ticket/mis-tickets
  //Solo el cliente autenticado puede ver sus propios tickets, no puede ver los tickets de otros clientes
  @Get('mis-tickets')
  @UseGuards(JwtAuthGuard)
  getMyTickets(@Req() req: any) { //Cambiado @Request por @Req
    return this.ticketService.findTickets(req.user, {}); 
  }

  //Endpoint para listar todos los tickets con filtros opcionales
  //GET /ticket/ListarTickets?estado=Pendiente&id_equipo=1
  //El cliente puede filtrar por {
  //estado, 
  //Pin, 
  //Trabajador, 
  //Fecha. Si no se envian filtros, se listan todos los tickets del cliente
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(
    @Req() req: any, 
    @Query() filters: any) {
    return this.ticketService.findTickets(req.user, filters);
  }

  //Endpoint para obtener las métricas del dashboard
  //GET /ticket/Metrics
  //El cliente obtiene el total de tickets creados, el total de tickets cerrados, y el tiempo promedio de resolución
  @Get('metrics')
  getMetrics(@Req() req: any) {
    return this.ticketService.getDashboardMetrics(req.user);
  }

  //Endpoint para obtener los detalles de un ticket por su ID
  //GET /ticket/DetallesTicket/1
  //Solo el cliente que creo el ticket o el soporte asignado pueden ver los detalles del ticket
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.ticketService.getTicketById(id, req.user);
  }

  @Post(':id/asignar')
  @Roles('SOPORTE_TECNICO')
  @UseGuards(JwtAuthGuard, RoleGuard)
  assign(
    @Param('id') id: string,
    @Body('soporteId') soporteId: string,
    @Req() req: any,
  ) {
    return this.ticketService.assignTicket(id, soporteId, req.user);
  }

  @Post(':id/iniciar')
  @Roles('SOPORTE_TECNICO')
  @UseGuards(JwtAuthGuard, RoleGuard)
  startProgress(@Param('id') id: string, @Req() req: any) {
    return this.ticketService.startProgress(id, req.user);
  }

  @Post(':id/resolver')
  @Roles('SOPORTE_TECNICO')
  @UseGuards(JwtAuthGuard, RoleGuard)
  resolve(@Param('id') id: string, @Req() req: any) {
    return this.ticketService.resolveTicket(id, req.user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateTicketDto: UpdateTicketDto) {
    return this.ticketService.update(id, updateTicketDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.ticketService.remove(id);
  }

  @Post(':id/reabrir')
  @Roles('TRABAJADOR')
  @UseGuards(JwtAuthGuard, RoleGuard)
  reopen(@Param('id') id: string, @Req() req: any) {
    return this.ticketService.reopenTicket(id, req.user);
  }
}
