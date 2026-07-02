//src/ticket/ticket.controller.ts
//Modulo de controlador para la tabla ticket
//importaciones necesarias:
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Req,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RoleGuard } from '@/common/guards/role.guard';
import { Roles } from '@/common/decorators/role.decorator';
import { JwtPayload } from '@/common/guards/jwt-auth.guard';

@Controller('tickets')
@UseGuards(JwtAuthGuard, RoleGuard)
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Get('metrics')
  @Roles(
    'ADMINISTRADOR',
    'CLIENTE_EMPRESA',
    'CLIENTE_SUCURSAL',
    'CLIENTE_TRABAJADOR',
    'SOPORTE_TECNICO',
    'SOPORTE_INSITU',
  )
  getMetrics(@Req() req: Request & { user: JwtPayload }) {
    return this.ticketService.getDashboardMetrics(req.user);
  }

  @Post()
  @Roles('CLIENTE_TRABAJADOR', 'CLIENTE_SUCURSAL', 'CLIENTE_EMPRESA')
  create(
    @Body() dto: CreateTicketDto,
    @Req() req: Request & { user: JwtPayload },
  ) {
    return this.ticketService.createTicket(dto, req.user);
  }

  @Get('mis-tickets')
  @UseGuards(JwtAuthGuard)
  getMyTickets(@Req() req: Request & { user: JwtPayload }) {
    return this.ticketService.findTickets(req.user, { vista: 'mis-tickets' });
  }

  @Get()
  @Roles(
    'ADMINISTRADOR',
    'CLIENTE_EMPRESA',
    'CLIENTE_SUCURSAL',
    'CLIENTE_TRABAJADOR',
    'SOPORTE_TECNICO',
    'SOPORTE_INSITU',
  )
  findAll(@Req() req: Request & { user: JwtPayload }, @Query() filters: any) {
    return this.ticketService.findTickets(req.user, filters);
  }

  @Get(':id')
  @Roles(
    'ADMINISTRADOR',
    'CLIENTE_EMPRESA',
    'CLIENTE_SUCURSAL',
    'CLIENTE_TRABAJADOR',
    'SOPORTE_TECNICO',
    'SOPORTE_INSITU',
  )
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request & { user: JwtPayload },
  ) {
    return this.ticketService.getTicketById(id, req.user);
  }

  @Patch(':id/asignar')
  @Roles('ADMINISTRADOR', 'SOPORTE_TECNICO', 'SOPORTE_INSITU')
  assign(
    @Param('id', ParseIntPipe) id: number,
    @Body('soporteId', ParseIntPipe) soporteId: number,
    @Req() req: Request & { user: JwtPayload },
  ) {
    return this.ticketService.assignTicket(id, soporteId, req.user);
  }

  @Patch(':id/iniciar')
  @Roles('SOPORTE_TECNICO', 'SOPORTE_INSITU')
  startProgress(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request & { user: JwtPayload },
  ) {
    return this.ticketService.startProgress(id, req.user);
  }

  @Patch(':id/resolver')
  @Roles('SOPORTE_TECNICO', 'SOPORTE_INSITU')
  resolve(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request & { user: JwtPayload },
  ) {
    return this.ticketService.resolveTicket(id, req.user);
  }

  @Patch(':id/reabrir')
  @Roles('CLIENTE_TRABAJADOR')
  reopen(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request & { user: JwtPayload },
  ) {
    return this.ticketService.reopenTicket(id, req.user);
  }
}
