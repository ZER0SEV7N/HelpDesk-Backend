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
import { Ticket, TicketStatus } from '../entities/Tickets.entity'; //Entidad de Ticket para interactuar con la base de datos
import { Repository } from 'typeorm'; //Repositorio de TypeORM para manejar las operaciones de base de datos
import { InjectRepository } from '@nestjs/typeorm'; //Para inyectar el repositorio de Ticket

//Servicio de Ticket
@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Ticket) //Utilizar un repositorio para el manejo del ticket en la BD
    private readonly ticketRepo: Repository<Ticket>,
  ){}

  //----------------------------------
  //Metodo para crear un nuevo ticket
  //ROl ENCARGADO: Trabajador
  //API: POST /tickets
  //----------------------------------
  async createTicket(dto: CreateTicketDto, user: any) {
    //Verificar rol del usuario
    if(user.role !== 'TRABAJADOR') {
      throw new ForbiddenException('No tienes permisos para crear un ticket');
    }

    //Validar coherencia software
    if (dto.es_software && !dto.id_software) {
      throw new BadRequestException(
        'Debe seleccionar un software si el incidente es de software',
      );
    }

    if(!dto.es_software) {
      dto.id_software = undefined; // Aseguramos que no se guarde un software si no es de software
    }

    //Generar PIN unico para el ticket
    const pin = await this.GenerateUniquePin();

    //Crear el nuevo ticket
    const newTicket = this.ticketRepo.create({
      pin,
      asunto: dto.asunto,
      detalle: dto.detalle,
      estado: TicketStatus.PENDIENTE, //Estado inicial del ticket
      id_equipo: dto.id_equipo,
      id_cliente: user.userId, //El cliente es el usuario que crea el ticket
      id_soporte: null, //No se asigna soporte al momento de crear el ticket
      id_software: dto.id_software,
      es_software: dto.es_software,
      imagen_url: dto.imagen_url ?? null,
    });

    //Guardar el ticket en la base de datos
    return await this.ticketRepo.save(newTicket);
  }

  //-------------------------------------------
  //Metodo privado para generar un PIN unico para cada Ticket
  //-------------------------------------------
  private async GenerateUniquePin():Promise<string> {
    let pin: string;
    let exists: Ticket | null;

    do {
      pin = Math.floor(100000 + Math.random() * 900000).toString(); //Genera un numero aleatorio de 6 digitos y lo convierte a string
      exists = await this.ticketRepo.findOne({ where: { pin } }); //Verifica si el PIN ya existe en la base de datos
    } while (exists); //Si el PIN ya existe, genera uno nuevo

    return pin; //Retorna el PIN unico generado
  }

  //------------------------------------
  //Metodo para obtener los tickets del trabajador
  //ROl ENCARGADO: Trabajador
  //API: GET /tickets
  //------------------------------------
  async getMyTickets(user: any) {
    if(user.role !== 'TRABAJADOR') {
      throw new ForbiddenException('No tienes permisos para ver los tickets');
    }

    return await this.ticketRepo.find({
      where: { id_cliente: user.userId },
      order: { fecha_creacion: 'DESC' },
    });
  }

  async findAll() {
    return this.ticketRepo.find({
      order: { fecha_creacion: 'DESC' },
    });
  }

  async findOne(id: number) {
    const ticket = await this.ticketRepo.findOne({ where: { id_ticket: id } });
    if (!ticket) {
      throw new NotFoundException(`Ticket con ID ${id} no encontrado`);
    }
    return ticket;
  }

  async update(id: number, updateTicketDto: UpdateTicketDto) {
    const ticket = await this.findOne(id);
    Object.assign(ticket, updateTicketDto);
    return this.ticketRepo.save(ticket);
  }

  async remove(id: number) {
    const ticket = await this.findOne(id);
    return this.ticketRepo.remove(ticket);
  }
}
