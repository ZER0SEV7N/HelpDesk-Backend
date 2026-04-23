//src/ticket/ticket.controller.ts
//Modulo de controlador para la tabla ticket
//importaciones necesarias:
import { Controller, Get, Post, Body, Patch, Param, Query, Req, ParseIntPipe, UseGuards, Delete  } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/auth/decorators/role.decorator';
import { UpdateTicketDto } from './dto/update-ticket.dto';

@Controller('tickets')
@UseGuards(JwtAuthGuard, RoleGuard)
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  //------------------------------------------
  // DASHBOARD METRICAS
  // GET /tickets/metrics
  // (Debe ir antes del :id para que NestJS no lo confunda con un ID de ticket)
  //------------------------------------------
  @Get('metrics')
  @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA', 'CLIENTE_SUCURSAL', 'CLIENTE_TRABAJADOR', 'SOPORTE_TECNICO', 'SOPORTE_INSITU')
  getMetrics(@Req() req: any) {
    return this.ticketService.getDashboardMetrics(req.user);
  }

//------------------------------------------
  // CREAR TICKET
  // POST /tickets
  //------------------------------------------
  @Post()
  @Roles('CLIENTE_TRABAJADOR', 'CLIENTE_SUCURSAL', 'CLIENTE_EMPRESA')
  create(@Body() dto: CreateTicketDto, @Req() req: any) {
    return this.ticketService.createTicket(dto, req.user);
  }

  //Endpoint para listar los tickets del cliente autenticado
  //GET /tickets/mis-tickets
  //Solo el cliente autenticado puede ver sus propios tickets, no puede ver los tickets de otros clientes
  @Get('mis-tickets')
  @UseGuards(JwtAuthGuard)
  getMyTickets(@Req() req: any) { //Cambiado @Request por @Req
    return this.ticketService.findTickets(req.user, {}); 
  }

  //------------------------------------------
  // LISTAR TICKETS (Filtra automáticamente según el rol)
  // GET /tickets?estado=Pendiente
  //------------------------------------------
  @Get()
  @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA', 'CLIENTE_SUCURSAL', 'CLIENTE_TRABAJADOR', 'SOPORTE_TECNICO', 'SOPORTE_INSITU')
  findAll(@Req() req: any, @Query() filters: any) {
    return this.ticketService.findTickets(req.user, filters);
  }
  

  //------------------------------------------
  // OBTENER DETALLE DE UN TICKET
  // GET /tickets/:id
  //------------------------------------------
  @Get(':id')
  @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA', 'CLIENTE_SUCURSAL', 'CLIENTE_TRABAJADOR', 'SOPORTE_TECNICO', 'SOPORTE_INSITU')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.ticketService.getTicketById(id, req.user);
  }
  
  //------------------------------------------
  // ASIGNAR TICKET A TÉCNICO
  // PATCH /tickets/:id/asignar
  //------------------------------------------
  @Patch(':id/asignar')
  @Roles('ADMINISTRADOR', 'SOPORTE_TECNICO', 'SOPORTE_INSITU')
  assign(
    @Param('id', ParseIntPipe) id: number,
    @Body('soporteId', ParseIntPipe) soporteId: number,
    @Req() req: any,
  ) {
    return this.ticketService.assignTicket(id, soporteId, req.user);
  }

  //------------------------------------------
  // INICIAR PROGRESO
  // PATCH /tickets/:id/iniciar
  //------------------------------------------
  @Patch(':id/iniciar')
  @Roles('SOPORTE_TECNICO', 'SOPORTE_INSITU')
  startProgress(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.ticketService.startProgress(id, req.user);
  }

  //------------------------------------------
  // RESOLVER TICKET (Cerrar)
  // PATCH /tickets/:id/resolver
  //------------------------------------------
  @Patch(':id/resolver')
  @Roles('SOPORTE_TECNICO', 'SOPORTE_INSITU')
  resolve(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.ticketService.resolveTicket(id, req.user);
  }

  //------------------------------------------
  // REABRIR TICKET
  // PATCH /tickets/:id/reabrir
  //------------------------------------------
  @Patch(':id/reabrir')
  @Roles('CLIENTE_TRABAJADOR')
  reopen(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.ticketService.reopenTicket(id, req.user);
  }
 
}
