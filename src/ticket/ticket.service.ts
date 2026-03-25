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

//Servicio de Ticket
@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Tickets) //Utilizar un repositorio para el manejo del ticket en la BD
    private readonly ticketRepo: Repository<Tickets>,
  ){}

  //----------------------------------
  //Metodo para crear un nuevo ticket
  //ROl ENCARGADO: Trabajador
  //API: POST /tickets
  //----------------------------------
  async createTicket(dto: CreateTicketDto, user: any) {
    //Verificar rol del usuario
    if(user.role !== 'TRABAJADOR' ) throw new ForbiddenException('Solo los trabajadores pueden crear tickets');
    
    //Validar que el ticket sea de software en el caso de que se haya marcado.
    if (dto.es_software && !dto.id_software) throw new BadRequestException('Debe seleccionar un software si el incidente es de software');
    
    //Si el ticket no es de software, asegurarse de que no se haya enviado un id_software
    if(!dto.es_software) dto.id_software = undefined;

    //Generar un PIN unico para el ticket
    const pin = await this.GenerateUniquePin();
    
    //Crear el nuevo ticket.
    const newTicket = this.ticketRepo.create({
      pin,
      asunto: dto.asunto,
      detalle: dto.detalle,
      estado: TicketStatus.PENDIENTE,
      id_equipo: dto.id_equipo,
      id_cliente: user.userId, 
      id_software: dto.id_software,
      es_software: dto.es_software,
      imagen_url: dto.imagen_url,
    });

    //
    return await this.ticketRepo.save(newTicket);
  }

  //-------------------------------------------
  //Metodo privado para generar un PIN unico para cada Ticket
  //-------------------------------------------
  private async GenerateUniquePin():Promise<string> {
    let pin: string;
    let exists: Tickets | null;

    do {
      pin = Math.floor(100000 + Math.random() * 900000).toString(); //Genera un numero aleatorio de 6 digitos y lo convierte a string
      exists = await this.ticketRepo.findOne({ where: { pin } }); //Verifica si el PIN ya existe en la base de datos
    } while (exists); //Si el PIN ya existe, genera uno nuevo

    return pin; //Retorna el PIN unico generado
  }

  //------------------------------------
  //Metodo para listar los tickets con filtros opcionales y control por rol
  //ROl ENCARGADO: TODOS (con diferentes niveles de acceso)
  //API: GET /tickets
  //------------------------------------
  async findTickets(user: any, filters: any) {
    //Construir la consulta base
    const query = this.ticketRepo
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.soporte', 'soporte')
      .leftJoinAndSelect('ticket.equipo', 'equipo')
      .leftJoinAndSelect('equipo.cliente', 'cliente_dueno')
      .leftJoinAndSelect('equipo.sucursal', 'sucursal');

    //Aplicar los filtros segun el estado del ticket
    if(filters.estado) query.andWhere('ticket.estado = :estado', { estado: filters.estado });
    //Aplicar el filtro por PIN si se proporciona
    if(filters.pin) query.andWhere('ticket.pin = :pin', { pin: filters.pin });
    //Aplicar el filtro por el nombre del trabajador asignado si se proporciona
    if(filters.soporte) query.andWhere('soporte.nombre LIKE :soporte', { soporte: `%${filters.soporte}%` });

    //Aplicar el filtro por la fecha de creacion si se proporciona
    if(filters.fecha_creacion) {
      const fecha = new Date(filters.fecha_creacion);
      const nextDay = new Date(fecha);
      nextDay.setDate(fecha.getDate() + 1);
      query.andWhere('ticket.fecha_creacion >= :fecha AND ticket.fecha_creacion < :nextDay', { fecha, nextDay });
    }

    //Retricciones por rol
    switch (user.role) {
      case 'TRABAJADOR':
        //Solo ve los tickets que él mismo creó
        query.andWhere('ticket.id_cliente = :id', { id: user.userId });
        break;
      case 'SOPORTE_TECNICO':
      case 'SOPORTE_SITU':
        //Solo ve los tickets que tiene asignados
        query.andWhere('ticket.id_soporte = :id', { id: user.userId });
        break;
      case 'CLIENTE_EMPRESA':
        //El dueño de la empresa puede ver TODOS los tickets de su empresa, sin importar quién los creó
        query.andWhere('cliente_dueno.id_cliente = :clienteId', { clienteId: user.clienteId });
        break;
      //El ADMINISTRADOR no tiene restricciones en el switch, ve todo.
    }
    const tickets = await query.getMany();

    return tickets.map(t => ({
      id_ticket: t.id_ticket,
      pin: t.pin,
      asunto: t.asunto,
      estado: t.estado,
      trabajador: t.soporte ? `${t.soporte.nombre} ${t.soporte.apellido}` : 'Sin asignar',
      equipo: t.equipo.tipo,
      cliente: t.equipo.cliente.nombre_principal, // El nombre de la empresa o persona natural
      sucursal: t.equipo.sucursal ? t.equipo.sucursal.nombre_sucursal : 'Principal',
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
      relations: ['equipo', 'cliente', 'soporte'], 
    });
    if (!ticket) throw new NotFoundException(`Ticket con ID ${id} no encontrado`);
    return ticket; 
  }

  //-----------------------------------------
  //Metodo para asignar un ticket a un tecnico de soporte
  //Rol encargado: Trabajador (para autoasignarse) | Administrador (para asignar a otros)
  //API: POST /tickets/:id/asignar
  //-----------------------------------------
  async assignTicket(ticketId: number, soporteId: number, user:any ) {
    if(user.role !== 'SOPORTE_TECNICO') {
      throw new ForbiddenException('No tienes permisos para asignar este ticket');
    }

    const ticket = await this.ticketRepo.findOne({
      where: { id_ticket: ticketId },
    });

    if(!ticket) {
      throw new NotFoundException('Ticket no encontrado');
    }

    if(ticket.estado !== TicketStatus.PENDIENTE) {
      throw new BadRequestException('Solo se pueden asignar tickets en estado Pendiente');
    }

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
    const ticket = await this.ticketRepo.findOne({
      where: { id_ticket: ticketId },
    });

    //Verificar que el ticket exista
    if(!ticket) throw new NotFoundException('Ticket no encontrado');

    //Verificar que el ticket este asignado al soporte que intenta iniciar el proceso
    if(ticket.id_soporte !== user.userId) {
      throw new ForbiddenException('No tienes permisos para iniciar este ticket');
    }
    ticket.estado = TicketStatus.EN_PROGRESO;
    return await this.ticketRepo.save(ticket);
  }


  //-----------------------------------------------------------
  //Metodo para resolver un ticket (cambiar estado a Resuelto)
  //El sistema cierra automaticamente el ticket cuando soporte termina
  //Rol encargado: Soporte Tecnico (solo puede resolver si el ticket esta asignado a el)
  //API: POST /tickets/:id/resolver
  async resolveTicket(ticketId: number, user:any) {
    const ticket = await this.ticketRepo.findOne({
      where: { id_ticket: ticketId }, 
    });

    //Verificar que el ticket exista
    if(!ticket) throw new NotFoundException('Ticket no encontrado');

    //Verificar que el ticket este asignado al soporte que intenta iniciar el proceso
    if(ticket.id_soporte !== user.userId) {
      throw new ForbiddenException('No tienes permisos para iniciar este ticket');
    }
    //Al resolver el ticket, se cambia su estado a CERRADO
    ticket.estado = TicketStatus.CERRADO;

    return await this.ticketRepo.save(ticket);
  }

  //-----------------------------------------------------------
  //Metodo para reabrir un ticket cerrado (cambiar estado a Reabierto)
  //Rol encargado: Trabajador (solo puede reabrir si el ticket esta creado por el)
  //API: POST /tickets/:id/reabrir
  async reopenTicket(ticketId: number, user:any) {
    const ticket = await this.ticketRepo.findOne({
      where: { id_ticket: ticketId }, 
    });

    //Verificar que el ticket exista
    if (!ticket) throw new NotFoundException();

    //Verificar que el usuario sea el trabajador que creo el ticket
    if (user.role !== 'TRABAJADOR') {
      throw new ForbiddenException('Solo trabajador puede reabrir');
    }

    //Verificar que el ticket este creado por el trabajador que intenta reabrirlo
    if (ticket.id_cliente !== user.userId) {
      throw new ForbiddenException('No autorizado');
    }

    //Solo se pueden reabrir tickets cerrados
    if (ticket.estado !== TicketStatus.CERRADO) {
      throw new BadRequestException('Solo tickets cerrados pueden reabrirse');
    }
    //Al reabrir el ticket, se cambia su estado a REABIERTO
    ticket.estado = TicketStatus.REABIERTO;

    return this.ticketRepo.save(ticket);
  }

  //-----------------------------------------------------------
  //Metricas para el Dashboard de los tickets (opcional)
  //API: GET /tickets/metrics
  async getDashboardMetrics(user: any){
    const query = this.ticketRepo.createQueryBuilder('ticket');
    //Verificar rol del usuario para mostrar solo los tickets relevantes
    if (user.role === 'TRABAJADOR') {
      query.where('ticket.id_cliente = :id', { id: user.userId });
    }
    
    const total = await query.getCount();
    const cerrados = await query.clone().andWhere('ticket.estado = :estado', { estado: TicketStatus.CERRADO }).getCount();
    const pendientes = await query.clone().andWhere('ticket.estado = :estado', { estado: TicketStatus.PENDIENTE }).getCount();
    const enProgreso = await query.clone().andWhere('ticket.estado = :estado', { estado: TicketStatus.EN_PROGRESO }).getCount();

    return { total, cerrados, pendientes, enProgreso };
  }

  async update(id: number, updateTicketDto: UpdateTicketDto) {
    const ticket = await this.getTicketById(id, null); 
    Object.assign(ticket, updateTicketDto);
    return this.ticketRepo.save(ticket);
  }

  async remove(id: number) {
    const ticket = await this.getTicketById(id, null); 
    return this.ticketRepo.remove(ticket);
  }
}
