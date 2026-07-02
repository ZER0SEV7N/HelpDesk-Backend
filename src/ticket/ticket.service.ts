import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { Tickets, TicketStatus } from '@/entities/Tickets.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Equipos } from '@/entities/Equipos.entity';
import { JwtPayload } from '@/common/guards/jwt-auth.guard';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Tickets)
    private readonly ticketRepo: Repository<Tickets>,
    @InjectRepository(Equipos)
    private readonly equiposRepo: Repository<Equipos>,
  ) {}

  private cleanTicketResponse(ticket: Tickets) {
    const ticketLimpio = { ...ticket } as Record<string, unknown>;

    if (ticketLimpio.soporte) {
      const soporte = ticketLimpio.soporte as Record<string, unknown>;
      const {
        contraseña: _contraseña,
        created_at: _created,
        updated_at: _updated,
        ...rest
      } = soporte;
      ticketLimpio.soporte = rest;
    }
    if (ticketLimpio.trabajador) {
      const trabajador = ticketLimpio.trabajador as Record<string, unknown>;
      const {
        contraseña: _contraseña_t,
        created_at: _created_t,
        updated_at: _updated_t,
        ...rest
      } = trabajador;
      ticketLimpio.trabajador = rest;
    }
    return ticketLimpio as Omit<Tickets, 'soporte' | 'trabajador'> & {
      soporte?: Record<string, unknown>;
      trabajador?: Record<string, unknown>;
    };
  }

  async createTicket(dto: CreateTicketDto, user: JwtPayload) {
    if (
      !['CLIENTE_TRABAJADOR', 'CLIENTE_SUCURSAL', 'CLIENTE_EMPRESA'].includes(
        user.role,
      )
    ) {
      throw new ForbiddenException(
        'Solo el personal del cliente puede crear tickets de soporte',
      );
    }

    if (dto.es_software && !dto.id_software)
      throw new BadRequestException(
        'Debe seleccionar un software si el incidente es de software',
      );
    if (!dto.es_software) dto.id_software = undefined;

    const equipo = await this.equiposRepo.findOne({
      where: { id_equipo: dto.id_equipo },
    });
    if (!equipo)
      throw new NotFoundException(
        `El equipo con ID ${dto.id_equipo} no existe`,
      );
    if (equipo.id_cliente !== user.clienteId) {
      throw new ForbiddenException(
        'No puedes crear un reporte para un equipo que no pertenece a tu empresa.',
      );
    }

    const pin = await this.GenerateUniquePin();

    const newTicket = this.ticketRepo.create({
      pin,
      asunto: dto.asunto,
      detalle: dto.detalle,
      estado: TicketStatus.PENDIENTE,
      id_equipo: equipo.id_equipo,
      id_cliente: user.clienteId,
      id_trabajador: user.userId,
      id_software: dto.id_software,
      es_software: dto.es_software,
      imagen_url: dto.imagen_url,
    });
    const ticket = await this.ticketRepo.save(newTicket);
    return {
      message: 'Ticket creado exitosamente',
      ticket: this.cleanTicketResponse(ticket),
    };
  }

  private async GenerateUniquePin(): Promise<string> {
    let pin: string;
    let exists: Tickets | null;
    do {
      pin = Math.floor(100000 + Math.random() * 900000).toString();
      exists = await this.ticketRepo.findOne({ where: { pin } });
    } while (exists);
    return pin;
  }

  async findTickets(user: JwtPayload, filters: any) {
    const query = this.ticketRepo
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.soporte', 'soporte')
      .leftJoinAndSelect('ticket.trabajador', 'trabajador')
      .leftJoinAndSelect('ticket.equipo', 'equipo')
      .leftJoinAndSelect('equipo.cliente', 'cliente_dueno')
      .leftJoinAndSelect('equipo.sucursal', 'sucursal');

    if (filters.estado)
      query.andWhere('ticket.estado = :estado', { estado: filters.estado });
    if (filters.pin) query.andWhere('ticket.pin = :pin', { pin: filters.pin });
    if (filters.soporte)
      query.andWhere('soporte.nombre LIKE :soporte', {
        soporte: `%${filters.soporte}%`,
      });
    if (filters.fecha_creacion) {
      const fecha = new Date(filters.fecha_creacion);
      const nextDay = new Date(fecha);
      nextDay.setDate(fecha.getDate() + 1);
      query.andWhere(
        'ticket.created_at >= :fecha AND ticket.created_at < :nextDay',
        { fecha, nextDay },
      );
    }

    switch (user.role) {
      case 'CLIENTE_TRABAJADOR':
        query
          .andWhere('ticket.id_trabajador = :id', { id: user.userId })
          .andWhere('ticket.id_cliente = :clienteId', {
            clienteId: user.clienteId,
          });
        break;
      case 'CLIENTE_SUCURSAL':
        query
          .andWhere('ticket.id_cliente = :clienteId', {
            clienteId: user.clienteId,
          })
          .andWhere('equipo.id_sucursal = :sucursalId', {
            sucursalId: user.sucursalId,
          });
        break;
      case 'CLIENTE_EMPRESA':
        query.andWhere('ticket.id_cliente = :clienteId', {
          clienteId: user.clienteId,
        });
        break;
      case 'SOPORTE_TECNICO':
      case 'SOPORTE_INSITU':
        if (filters.vista === 'mis-tickets') {
          query.andWhere('ticket.id_soporte = :id', { id: user.userId });
        } else {
          query.andWhere(
            '(ticket.id_soporte = :id OR ticket.estado = :estadoPendiente)',
            {
              id: user.userId,
              estadoPendiente: TicketStatus.PENDIENTE,
            },
          );
        }
        break;
    }

    if (filters.vista === 'abiertos') {
      query.andWhere('ticket.estado IN (:...estados)', {
        estados: [
          TicketStatus.PENDIENTE,
          TicketStatus.ASIGNADO,
          TicketStatus.EN_PROGRESO,
          TicketStatus.REABIERTO,
        ],
      });
    }

    const tickets = await query.getMany();

    return tickets.map((t) => ({
      id_ticket: t.id_ticket,
      pin: t.pin,
      asunto: t.asunto,
      estado: t.estado,
      trabajador: t.trabajador
        ? `${t.trabajador.nombre} ${t.trabajador.apellido}`
        : 'Sin asignar',
      equipo: t.equipo ? t.equipo.tipo : 'N/A',
      cliente:
        t.equipo && t.equipo.cliente
          ? t.equipo.cliente.nombre_principal
          : 'N/A',
      sucursal:
        t.equipo && t.equipo.sucursal
          ? t.equipo.sucursal.nombre_sucursal
          : 'Principal',
    }));
  }

  async getTicketById(id: number, user: JwtPayload) {
    const ticket = await this.ticketRepo.findOne({
      where: { id_ticket: id },
      relations: ['equipo', 'cliente', 'soporte', 'trabajador'],
    });
    if (!ticket)
      throw new NotFoundException(`Ticket con ID ${id} no encontrado`);

    if (user.role === 'ADMINISTRADOR') {
      return this.cleanTicketResponse(ticket);
    }

    if (
      ['CLIENTE_TRABAJADOR', 'CLIENTE_SUCURSAL', 'CLIENTE_EMPRESA'].includes(
        user.role,
      )
    ) {
      if (ticket.id_cliente !== user.clienteId)
        throw new ForbiddenException('No tienes acceso a este ticket');
    } else if (['SOPORTE_TECNICO', 'SOPORTE_INSITU'].includes(user.role)) {
      if (
        ticket.id_soporte !== user.userId &&
        ticket.estado !== TicketStatus.PENDIENTE
      ) {
        throw new ForbiddenException('No tienes acceso a este ticket');
      }
    }

    return this.cleanTicketResponse(ticket);
  }

  async assignTicket(ticketId: number, soporteId: number, user: JwtPayload) {
    if (
      !['ADMINISTRADOR', 'SOPORTE_TECNICO', 'SOPORTE_INSITU'].includes(
        user.role,
      )
    ) {
      throw new ForbiddenException(
        'No tienes permisos para asignar este ticket',
      );
    }

    if (
      ['SOPORTE_TECNICO', 'SOPORTE_INSITU'].includes(user.role) &&
      soporteId !== user.userId
    ) {
      throw new ForbiddenException('Solo puedes asignarte tickets a ti mismo');
    }

    const ticket = await this.ticketRepo.findOne({
      where: { id_ticket: ticketId },
    });
    if (!ticket) throw new NotFoundException('Ticket no encontrado');
    if (ticket.estado !== TicketStatus.PENDIENTE)
      throw new BadRequestException(
        'Solo se pueden asignar tickets en estado Pendiente',
      );

    ticket.id_soporte = soporteId;
    ticket.estado = TicketStatus.ASIGNADO;
    return await this.ticketRepo.save(ticket);
  }

  async startProgress(ticketId: number, user: JwtPayload) {
    const ticket = await this.ticketRepo.findOne({
      where: { id_ticket: ticketId },
    });
    if (!ticket) throw new NotFoundException('Ticket no encontrado');
    if (ticket.id_soporte !== user.userId)
      throw new ForbiddenException(
        'No tienes permisos para iniciar este ticket',
      );

    ticket.estado = TicketStatus.EN_PROGRESO;
    return await this.ticketRepo.save(ticket);
  }

  async resolveTicket(ticketId: number, user: JwtPayload) {
    const ticket = await this.ticketRepo.findOne({
      where: { id_ticket: ticketId },
    });
    if (!ticket) throw new NotFoundException('Ticket no encontrado');
    if (ticket.id_soporte !== user.userId)
      throw new ForbiddenException(
        'No tienes permisos para resolver este ticket',
      );

    ticket.estado = TicketStatus.CERRADO;
    return await this.ticketRepo.save(ticket);
  }

  async reopenTicket(ticketId: number, user: JwtPayload) {
    const ticket = await this.ticketRepo.findOne({
      where: { id_ticket: ticketId },
    });
    if (!ticket) throw new NotFoundException('Ticket no encontrado');

    if (user.role !== 'CLIENTE_TRABAJADOR')
      throw new ForbiddenException(
        'Solo el trabajador original puede reabrir el ticket',
      );

    if (ticket.id_trabajador !== user.userId)
      throw new ForbiddenException(
        'No puedes reabrir un ticket que no creaste tú',
      );

    if (ticket.estado !== TicketStatus.CERRADO)
      throw new BadRequestException('Solo tickets cerrados pueden reabrirse');

    ticket.estado = TicketStatus.REABIERTO;
    return this.ticketRepo.save(ticket);
  }

  async getDashboardMetrics(user: JwtPayload) {
    const query = this.ticketRepo.createQueryBuilder('ticket');

    if (user.role === 'ADMINISTRADOR') {
      // Admin ve todas las métricas sin filtro
    } else if (user.role === 'CLIENTE_TRABAJADOR') {
      query.where('ticket.id_trabajador = :id', { id: user.userId });
    } else if (user.role === 'CLIENTE_SUCURSAL') {
      query
        .innerJoin('ticket.equipo', 'equipo')
        .where('equipo.id_sucursal = :id', { id: user.sucursalId });
    } else if (user.role === 'CLIENTE_EMPRESA') {
      query.where('ticket.id_cliente = :id', { id: user.clienteId });
    } else if (
      user.role === 'SOPORTE_TECNICO' ||
      user.role === 'SOPORTE_INSITU'
    ) {
      query.where('ticket.id_soporte = :id', { id: user.userId });
    }

    const total = await query.getCount();
    const cerrados = await query
      .clone()
      .andWhere('ticket.estado = :estado', { estado: TicketStatus.CERRADO })
      .getCount();
    const pendientes = await query
      .clone()
      .andWhere('ticket.estado = :estado', { estado: TicketStatus.PENDIENTE })
      .getCount();
    const enProgreso = await query
      .clone()
      .andWhere('ticket.estado = :estado', { estado: TicketStatus.EN_PROGRESO })
      .getCount();

    return { total, cerrados, pendientes, enProgreso };
  }
}
