//src/ticket/ticket.controller.ts
//Modulo de controlador para la tabla ticket
//importaciones necesarias:
import { Controller, Get, Post, Body, Patch, Param, Query, Req, ParseIntPipe  } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/auth/decorators/role.decorator';

@Controller('ticket')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  //Endpoint para crear un nuevo ticket
  //POST /ticket/CrearTicket
  //El cliente envia el {
  // asunto, 
  // detalle, 
  // id_equipo, 
  // id_software (opcional), 
  // es_software (booleano para indicar si el problema es de software o hardware) 
  // y una imagen (opcional)
  @Post()
  @Roles('TRABAJADOR')
  create(@Body() dto: CreateTicketDto,
         @Req() req: any,
        ) {
    return this.ticketService.createTicket(dto, req.user);
  }

  //Endpoint para listar todos los tickets con filtros opcionales
  //GET /ticket/ListarTickets?estado=Pendiente&id_equipo=1
  //El cliente puede filtrar por {
  // estado, 
  // Pin, 
  // Trabajador, 
  // Fecha. Si no se envian filtros, se listan todos los tickets del cliente
  @Get()
  findAll(
    @Req() req: any, 
    @Query() filters: any) {
    return this.ticketService.findTickets(req.user, filters);
  }

  //Endpoint para obtener los detalles de un ticket por su ID
  //GET /ticket/DetallesTicket/1
  //Solo el cliente que creo el ticket o el soporte asignado pueden ver los detalles del ticket
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) 
    id: number,   
    @Req() req: any) {
    return this.ticketService.getTicketById(id, req.user);
  }
  
  //Endpoint para asignar un ticket a un soporte (solo para admin)
  //Post /ticket/AsignarTicket/1
  //El admin envia el ID del ticket y el ID del soporte al que se asignara el ticket
  @Post(':id/asignar')
  @Roles('SOPORTE_TECNICO')
  assign(
    @Param('id', ParseIntPipe) id: number,
    @Body('soporteId') soporteId: number,
    @Req() req: any,
  ) {
    return this.ticketService.assignTicket(id, soporteId, req.user);
  }

  //Endpoint para que el soporte inicie el progreso del ticket
  //Post /ticket/IniciarProgreso/1
  //Solo el soporte asignado puede iniciar el progreso del ticket
  @Post(':id/iniciar')
  @Roles('SOPORTE_TECNICO')
  startProgress(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.ticketService.startProgress(id, req.user);
  }

  //Endpoint para que el soporte resuelva el ticket
  //Post /ticket/ResolverTicket/1
  //Solo el soporte asignado puede resolver el ticket
  @Post(':id/resolver')
  @Roles('SOPORTE_TECNICO')
  resolve(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.ticketService.resolveTicket(id, req.user);
  }

  //Endpoint para que el cliente reabra el ticket
  //Post /ticket/ReabrirTicket/1
  //Solo el cliente que creo el ticket puede reabrirlo, y solo si el ticket esta cerrado
  @Post(':id/reabrir')
  @Roles('TRABAJADOR')
  reopen(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.ticketService.reopenTicket(id, req.user);
  }

  //Endpoint para obtener las métricas del dashboard
  //GET /ticket/Metrics
  //El cliente obtiene el total de tickets creados, el total de tickets cerrados, y el tiempo promedio de resolución
  @Get('metrics')
  getMetrics(@Req() req: any) {
    return this.ticketService.getDashboardMetrics(req.user);
  }

}
