import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { Ticket, TicketDocument, TicketStatus } from '../schemas/ticket.schema';

@Injectable()
export class TicketService {
  constructor(
    @InjectModel(Ticket.name) private ticketModel: Model<TicketDocument>,
  ) {}

  async createTicket(dto: CreateTicketDto, user: any) {
    if (user.role !== 'TRABAJADOR') {
      throw new ForbiddenException('No tienes permisos para crear un ticket');
    }
    if (dto.es_software && !dto.id_software) {
      throw new BadRequestException('Debe seleccionar un software si el incidente es de software');
    }
    const pin = await this.generateUniquePin();
    const idEquipo = new Types.ObjectId(dto.id_equipo);
    const newTicket = await this.ticketModel.create({
      pin,
      asunto: dto.asunto,
      detalle: dto.detalle,
      estado: TicketStatus.PENDIENTE,
      id_equipo: idEquipo,
      id_cliente: new Types.ObjectId(user.userId),
      id_soporte: undefined,
      id_software: dto.es_software ? dto.id_software : undefined,
      es_software: dto.es_software ?? false,
      imagen_url: dto.imagen_url,
    });
    return newTicket.toObject();
  }

  private async generateUniquePin(): Promise<string> {
    let pin: string;
    let exists: TicketDocument | null;
    do {
      pin = Math.floor(100000 + Math.random() * 900000).toString();
      exists = await this.ticketModel.findOne({ pin }).exec();
    } while (exists);
    return pin;
  }

  async findTickets(user: any, filters: any) {
    const query: any = {};
    if (filters.estado) query.estado = filters.estado;
    if (filters.pin) query.pin = filters.pin;
    if (filters.fecha_creacion) {
      const fecha = new Date(filters.fecha_creacion);
      const nextDay = new Date(fecha);
      nextDay.setDate(fecha.getDate() + 1);
      query.fecha_creacion = { $gte: fecha, $lt: nextDay };
    }
    switch (user.role) {
      case 'TRABAJADOR':
        query.id_cliente = new Types.ObjectId(user.userId);
        break;
      case 'SOPORTE_IN_SITU':
        query.id_soporte = new Types.ObjectId(user.userId);
        break;
      case 'CLIENTE_EMPRESA':
        if (user.empresaId) query['equipo.empresa'] = new Types.ObjectId(user.empresaId);
        break;
    }
    const tickets = await this.ticketModel
      .find(query)
      .populate('id_soporte', 'nombre apellido')
      .populate({ path: 'id_equipo', populate: { path: 'empresa', select: 'nombre_cliente' } })
      .sort({ fecha_creacion: -1 })
      .lean()
      .exec();
    return tickets.map((t: any) => ({
      _id: t._id,
      pin: t.pin,
      asunto: t.asunto,
      estado: t.estado,
      trabajador: t.id_soporte ? `${t.id_soporte.nombre} ${t.id_soporte.apellido}` : '------',
      equipo: t.id_equipo?.tipo,
      empresa: t.id_equipo?.empresa?.nombre_cliente,
      fecha_creacion: t.fecha_creacion,
    }));
  }

  async getTicketById(id: string, user: any) {
    const ticket = await this.ticketModel
      .findById(id)
      .populate('id_equipo')
      .populate('id_cliente', 'nombre apellido correo')
      .populate('id_soporte', 'nombre apellido')
      .lean()
      .exec();
    if (!ticket) throw new NotFoundException(`Ticket con ID ${id} no encontrado`);
    return ticket;
  }

  async assignTicket(ticketId: string, soporteId: string, user: any) {
    if (user.role !== 'SOPORTE_TECNICO') {
      throw new ForbiddenException('No tienes permisos para asignar este ticket');
    }
    const ticket = await this.ticketModel.findById(ticketId).exec();
    if (!ticket) throw new NotFoundException('Ticket no encontrado');
    if (ticket.estado !== TicketStatus.PENDIENTE) {
      throw new BadRequestException('Solo se pueden asignar tickets en estado Pendiente');
    }
    ticket.id_soporte = new Types.ObjectId(soporteId);
    ticket.estado = TicketStatus.ASIGNADO;
    await ticket.save();
    return ticket.toObject();
  }

  async startProgress(ticketId: string, user: any) {
    const ticket = await this.ticketModel.findById(ticketId).exec();
    if (!ticket) throw new NotFoundException('Ticket no encontrado');
    if (ticket.id_soporte?.toString() !== user.userId) {
      throw new ForbiddenException('No tienes permisos para iniciar este ticket');
    }
    ticket.estado = TicketStatus.EN_PROGRESO;
    await ticket.save();
    return ticket.toObject();
  }

  async resolveTicket(ticketId: string, user: any) {
    const ticket = await this.ticketModel.findById(ticketId).exec();
    if (!ticket) throw new NotFoundException('Ticket no encontrado');
    if (ticket.id_soporte?.toString() !== user.userId) {
      throw new ForbiddenException('No tienes permisos para resolver este ticket');
    }
    ticket.estado = TicketStatus.CERRADO;
    await ticket.save();
    return ticket.toObject();
  }

  async reopenTicket(ticketId: string, user: any) {
    const ticket = await this.ticketModel.findById(ticketId).exec();
    if (!ticket) throw new NotFoundException('Ticket no encontrado');
    if (user.role !== 'TRABAJADOR') throw new ForbiddenException('Solo trabajador puede reabrir');
    if (ticket.id_cliente.toString() !== user.userId) throw new ForbiddenException('No autorizado');
    if (ticket.estado !== TicketStatus.CERRADO) {
      throw new BadRequestException('Solo tickets cerrados pueden reabrirse');
    }
    ticket.estado = TicketStatus.REABIERTO;
    await ticket.save();
    return ticket.toObject();
  }

  async getDashboardMetrics(user: any) {
    const baseQuery: any = user.role === 'TRABAJADOR' ? { id_cliente: new Types.ObjectId(user.userId) } : {};
    const [total, cerrados, pendientes, enProgreso] = await Promise.all([
      this.ticketModel.countDocuments(baseQuery),
      this.ticketModel.countDocuments({ ...baseQuery, estado: TicketStatus.CERRADO }),
      this.ticketModel.countDocuments({ ...baseQuery, estado: TicketStatus.PENDIENTE }),
      this.ticketModel.countDocuments({ ...baseQuery, estado: TicketStatus.EN_PROGRESO }),
    ]);
    return { total, cerrados, pendientes, enProgreso };
  }

  async update(id: string, updateTicketDto: UpdateTicketDto) {
    const ticket = await this.ticketModel.findByIdAndUpdate(
      id,
      { $set: updateTicketDto },
      { new: true },
    ).exec();
    if (!ticket) throw new NotFoundException(`Ticket con ID ${id} no encontrado`);
    return ticket.toObject();
  }

  async remove(id: string) {
    const ticket = await this.ticketModel.findByIdAndDelete(id).exec();
    if (!ticket) throw new NotFoundException(`Ticket con ID ${id} no encontrado`);
    return ticket.toObject();
  }
}
