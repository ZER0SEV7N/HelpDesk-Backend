//ticket.service.ts
//Servicio para manejar la logica de negocio relacionada con los tickets
// - Crear un nuevo ticket
// - Obtener todos los tickets
// - Obtener un ticket por filtrado
// - Actualizar el estado de un ticket
// - Asignar un ticket a un tecnico
// - ROLES involucrados: Trabajador | Soporte_Tecnico | Soporte_IN_Situ |
//Importaciones necesarias:
import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common'; //Para marcar esta clase como un servicio inyectable
import { CreateTicketDto } from './dto/create-ticket.dto'; //DTO para la creacion de un ticket
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { Tickets, TicketStatus } from '../entities/Tickets.entity'; //Entidad de Ticket para interactuar con la base de datos
import { Repository } from 'typeorm'; //Repositorio de TypeORM para manejar las operaciones de base de datos
import { InjectRepository } from '@nestjs/typeorm'; //Para inyectar el repositorio de Ticket
import { Equipos } from 'src/entities/Equipos.entity';

//Servicio de Ticket
@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Tickets) //Utilizar un repositorio para el manejo del ticket en la BD
    private readonly ticketRepo: Repository<Tickets>,
    @InjectRepository(Equipos) // <-- INYECTAMOS EQUIPOS PARA VALIDAR PROPIEDAD
    private readonly equiposRepo: Repository<Equipos>,
  ){}

  private cleanTicketResponse(ticket: Tickets) {
    const ticketLimpio = { ...ticket };

    // Limpiamos datos sensibles del técnico de soporte
    if (ticketLimpio.soporte) {
        const { contraseña, created_at, updated_at, ...soporteLimpio } = ticketLimpio.soporte;
        ticketLimpio.soporte = soporteLimpio as any;
    }
    // Limpiamos datos del trabajador
    if (ticketLimpio.trabajador) {
        const { contraseña, created_at, updated_at, ...trabajadorLimpio } = ticketLimpio.trabajador;
        ticketLimpio.trabajador = trabajadorLimpio as any;
    }
    return ticketLimpio;
  }

  //----------------------------------
  //Metodo para crear un nuevo ticket
  //ROl ENCARGADO: Trabajador
  //API: POST /tickets
  //----------------------------------
async createTicket(dto: CreateTicketDto, user: any) {
    //Verificar rol (Permitimos a Trabajadores, Jefes de Sucursal y Gerentes crear tickets)
    if(!['CLIENTE_TRABAJADOR', 'CLIENTE_SUCURSAL', 'CLIENTE_EMPRESA'].includes(user.role)) {
        throw new ForbiddenException('Solo el personal del cliente puede crear tickets de soporte');
    }
    
    //Validar Software
    if (dto.es_software && !dto.id_software) throw new BadRequestException('Debe seleccionar un software si el incidente es de software');
    if (!dto.es_software) dto.id_software = undefined;

    //SEGURIDAD MULTI-TENANT: Validar que el equipo exista y pertenezca a la empresa del usuario
    const equipo = await this.equiposRepo.findOne({ where: { id_equipo: dto.id_equipo } });
    if (!equipo) throw new NotFoundException(`El equipo con ID ${dto.id_equipo} no existe`);
    if (equipo.id_cliente !== user.clienteId) {
        throw new ForbiddenException('No puedes crear un reporte para un equipo que no pertenece a tu empresa.');
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

  //-------------------------------------------
  //Metodo privado para generar un PIN unico para cada Ticket
  //-------------------------------------------
  private async GenerateUniquePin():Promise<string> {
    let pin: string;
    let exists: Tickets | null;
    do {
      pin = Math.floor(100000 + Math.random() * 900000).toString(); 
      exists = await this.ticketRepo.findOne({ where: { pin } }); 
    } while (exists); 
    return pin; 
  }

  //------------------------------------
  //Metodo para listar los tickets con filtros opcionales y control por rol
  //ROl ENCARGADO: TODOS (con diferentes niveles de acceso)
  //API: GET /tickets
  //------------------------------------
async findTickets(user: any, filters: any) {
    const query = this.ticketRepo
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.soporte', 'soporte')
      .leftJoinAndSelect('ticket.equipo', 'equipo')
      .leftJoinAndSelect('equipo.cliente', 'cliente_dueno')
      .leftJoinAndSelect('equipo.sucursal', 'sucursal');

    if(filters.estado) query.andWhere('ticket.estado = :estado', { estado: filters.estado });
    if(filters.pin) query.andWhere('ticket.pin = :pin', { pin: filters.pin });
    if(filters.soporte) query.andWhere('soporte.nombre LIKE :soporte', { soporte: `%${filters.soporte}%` });

    if(filters.fecha_creacion) {
      const fecha = new Date(filters.fecha_creacion);
      const nextDay = new Date(fecha);
      nextDay.setDate(fecha.getDate() + 1);
      query.andWhere('ticket.fecha_creacion >= :fecha AND ticket.fecha_creacion < :nextDay', { fecha, nextDay });
    }

    switch (user.role) {
      case 'CLIENTE_TRABAJADOR':
        query.andWhere('ticket.id_trabajador = :id', { id: user.userId })
             .andWhere('ticket.id_cliente = :clienteId', { clienteId: user.clienteId });
        break;
      case 'CLIENTE_SUCURSAL':
        // El jefe de sucursal ve los tickets de su sucursal específica
        query.andWhere('equipo.id_sucursal = :sucursalId', { sucursalId: user.sucursalId });
        break;
      case 'CLIENTE_EMPRESA':
        query.andWhere('ticket.id_cliente = :clienteId', { clienteId: user.clienteId });
        break;
      case 'SOPORTE_TECNICO':
      case 'SOPORTE_INSITU': // <-- CORREGIDO
        query.andWhere('(ticket.id_soporte = :id OR ticket.estado = :estadoPendiente)', { 
            id: user.userId, 
            estadoPendiente: TicketStatus.PENDIENTE 
        });
        break;
    }
    
    const tickets = await query.getMany();

    return tickets.map(t => ({
      id_ticket: t.id_ticket,
      pin: t.pin,
      asunto: t.asunto,
      estado: t.estado,
      trabajador: t.soporte ? `${t.soporte.nombre} ${t.soporte.apellido}` : 'Sin asignar',
      equipo: t.equipo ? t.equipo.tipo : 'N/A',
      cliente: t.equipo && t.equipo.cliente ? t.equipo.cliente.nombre_principal : 'N/A', 
      sucursal: t.equipo && t.equipo.sucursal ? t.equipo.sucursal.nombre_sucursal : 'Principal',
    }));
  }

  //--------------------------------------
  //Metodo para obtener el detalle de un ticket por su PIN
  //ROl ENCARGADO: TODOS (con diferentes niveles de acceso)
  //API: GET /tickets/:pin
  //--------------------------------------
  async getTicketById(id: number, user: any){
    const ticket = await this.ticketRepo.findOne({
      where: { id_ticket: id },
      relations: ['equipo', 'cliente', 'soporte', 'trabajador'], // Agregamos trabajador para saber quién lo creó
    });
    if (!ticket) throw new NotFoundException(`Ticket con ID ${id} no encontrado`);

    // Seguridad: Si es cliente, validar que el ticket sea de su empresa
    if (['CLIENTE_TRABAJADOR', 'CLIENTE_SUCURSAL', 'CLIENTE_EMPRESA'].includes(user.role)) {
        if (ticket.id_cliente !== user.clienteId) throw new ForbiddenException('No tienes acceso a este ticket');
    }

    return this.cleanTicketResponse(ticket); 
  }

  //-----------------------------------------
  //Metodo para asignar un ticket a un tecnico de soporte
  //Rol encargado: Trabajador (para autoasignarse) | Administrador (para asignar a otros)
  //API: POST /tickets/:id/asignar
  //-----------------------------------------
  async assignTicket(ticketId: number, soporteId: number, user:any ) {
    // Permitimos a Admin y a los propios técnicos asignarse tickets
    if(!['ADMINISTRADOR', 'SOPORTE_TECNICO', 'SOPORTE_INSITU'].includes(user.role)) {
      throw new ForbiddenException('No tienes permisos para asignar este ticket');
    }

    const ticket = await this.ticketRepo.findOne({ where: { id_ticket: ticketId } });
    if(!ticket) throw new NotFoundException('Ticket no encontrado');
    if(ticket.estado !== TicketStatus.PENDIENTE) throw new BadRequestException('Solo se pueden asignar tickets en estado Pendiente');

    ticket.id_soporte = soporteId;
    ticket.estado = TicketStatus.ASIGNADO;
    return await this.ticketRepo.save(ticket);
  }

  //--------------------------------------------
  //Metodo para iniciar el proceso de resolver un ticket (cambiar estado a En Progreso)
  //Rol encargado: Soporte Tecnico (solo puede iniciar el proceso si el ticket esta asignado a el)
  //API: POST /tickets/:id/iniciar
  //--------------------------------------------
  async startProgress(ticketId: number, user:any) {
    const ticket = await this.ticketRepo.findOne({ where: { id_ticket: ticketId } });
    if(!ticket) throw new NotFoundException('Ticket no encontrado');
    if(ticket.id_soporte !== user.userId) throw new ForbiddenException('No tienes permisos para iniciar este ticket');
    
    ticket.estado = TicketStatus.EN_PROGRESO;
    return await this.ticketRepo.save(ticket);
  }


  //-----------------------------------------------------------
  //Metodo para resolver un ticket (cambiar estado a Resuelto)
  //El sistema cierra automaticamente el ticket cuando soporte termina
  //Rol encargado: Soporte Tecnico (solo puede resolver si el ticket esta asignado a el)
  //API: POST /tickets/:id/resolver
  async resolveTicket(ticketId: number, user:any) {
    const ticket = await this.ticketRepo.findOne({ where: { id_ticket: ticketId } });
    if(!ticket) throw new NotFoundException('Ticket no encontrado');
    if(ticket.id_soporte !== user.userId) throw new ForbiddenException('No tienes permisos para resolver este ticket');
    
    ticket.estado = TicketStatus.CERRADO;
    return await this.ticketRepo.save(ticket);
  }

  //-----------------------------------------------------------
  //Metodo para reabrir un ticket cerrado (cambiar estado a Reabierto)
  //Rol encargado: Trabajador (solo puede reabrir si el ticket esta creado por el)
  //API: POST /tickets/:id/reabrir
  async reopenTicket(ticketId: number, user:any) {
    const ticket = await this.ticketRepo.findOne({ where: { id_ticket: ticketId } });
    if (!ticket) throw new NotFoundException('Ticket no encontrado');

    if (user.role !== 'CLIENTE_TRABAJADOR') throw new ForbiddenException('Solo el trabajador original puede reabrir el ticket');

    // <-- CORREGIDO: Validar contra el id_trabajador, no contra el id_cliente
    if (ticket.id_trabajador !== user.userId) throw new ForbiddenException('No puedes reabrir un ticket que no creaste tú');

    if (ticket.estado !== TicketStatus.CERRADO) throw new BadRequestException('Solo tickets cerrados pueden reabrirse');
    
    ticket.estado = TicketStatus.REABIERTO;
    return this.ticketRepo.save(ticket);
  }

  //-----------------------------------------------------------
  //Metricas para el Dashboard de los tickets (opcional)
  //API: GET /tickets/metrics
  async getDashboardMetrics(user: any){
    const query = this.ticketRepo.createQueryBuilder('ticket');
    
    if (user.role === 'CLIENTE_TRABAJADOR') {
      query.where('ticket.id_trabajador = :id', { id: user.userId }); 
    } else if (user.role === 'CLIENTE_SUCURSAL') {
      query.innerJoin('ticket.equipo', 'equipo').where('equipo.id_sucursal = :id', { id: user.sucursalId });
    } else if (user.role === 'CLIENTE_EMPRESA') {
      query.where('ticket.id_cliente = :id', { id: user.clienteId }); 
    } else if (user.role === 'SOPORTE_TECNICO' || user.role === 'SOPORTE_INSITU') {
      query.where('ticket.id_soporte = :id', { id: user.userId });
    }
    
    const total = await query.getCount();
    const cerrados = await query.clone().andWhere('ticket.estado = :estado', { estado: TicketStatus.CERRADO }).getCount();
    const pendientes = await query.clone().andWhere('ticket.estado = :estado', { estado: TicketStatus.PENDIENTE }).getCount();
    const enProgreso = await query.clone().andWhere('ticket.estado = :estado', { estado: TicketStatus.EN_PROGRESO }).getCount();

    return { total, cerrados, pendientes, enProgreso };
  }

}