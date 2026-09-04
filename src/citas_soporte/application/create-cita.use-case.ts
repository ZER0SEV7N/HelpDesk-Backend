// src/citas_soporte/application/create-cita.use-case.ts
import { Citas_Soporte, EstadoCita } from '@/entities/Citas-Soporte.entity';
import { Tickets } from '@/entities/Tickets.entity';
import { Usuario } from '@/entities/Usuario.entity';
import { Rol } from '@/entities/Rol.entity';
import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCitaDto } from '../dto/create-cita-dto';

@Injectable()
export class CreateCitaUseCase {
  constructor(
    @InjectRepository(Citas_Soporte)
    private readonly citasRepository: Repository<Citas_Soporte>,
    @InjectRepository(Tickets)
    private readonly ticketsRepository: Repository<Tickets>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async execute(citaData: CreateCitaDto): Promise<string> {
    const fechaProgramada = new Date(citaData.fecha_programada);

    // 1. Validar fecha pasada
    if (fechaProgramada < new Date()) {
      throw new BadRequestException(
        'La fecha programada no puede ser en el pasado.',
      );
    }

    // 2. Validar que el usuario asignado exista y tenga el rol SOPORTE_INSITU
    const soporteValido = await this.usuarioRepository.findOne({
      where: {
        id_usuario: citaData.id_soporte,
        rol: { id_rol: 3 }, // SOPORTE_INSITU
      },
    });

    if (!soporteValido) {
      throw new NotFoundException(
        `El usuario con ID #${citaData.id_soporte} no existe o no cuenta con el rol SOPORTE_INSITU.`,
      );
    }

    // 3. Validar presencia de tickets
    if (!citaData.ticket_ids || citaData.ticket_ids.size === 0) {
      throw new BadRequestException(
        'Debe asociar al menos un ticket derivado para agendar la cita presencial.',
      );
    }

    const ticketIdsArray = Array.from(citaData.ticket_ids);

    // 4. Validar solapamiento por sucursal y fecha[cite: 1]
    const activeCita = await this.citasRepository.findOne({
      where: {
        sucursal: { id_sucursal: citaData.id_sucursal },
        fecha_programada: fechaProgramada,
        estado: In([EstadoCita.PENDIENTE, EstadoCita.EN_CAMINO]),
      },
    });

    if (activeCita) {
      throw new ConflictException(
        'Ya existe una cita activa (Pendiente o En Camino) para esta sucursal en la fecha seleccionada.',
      );
    }

    // 5. Obtener las entidades de Tickets desde la BD
    const tickets = await this.ticketsRepository.findBy({
      id_ticket: In(ticketIdsArray),
    });

    if (tickets.length !== ticketIdsArray.length) {
      throw new NotFoundException(
        'Uno o más tickets especificados no fueron encontrados.',
      );
    }

    // 6. Validar que NINGÚN ticket esté 'Cerrado'
    const ticketCerrado = tickets.find((t: any) => t.estado === 'Cerrado');
    if (ticketCerrado) {
      throw new BadRequestException(
        `El ticket #${ticketCerrado.id_ticket} se encuentra Cerrado y no puede asociarse a una nueva cita.`,
      );
    }

    // 7. Validar que los tickets no estén ya asociados a otra cita activa
    const ticketEnCitaActiva = await this.citasRepository
      .createQueryBuilder('cita')
      .innerJoin('cita.tickets', 'ticket')
      .where('ticket.id_ticket IN (:...ticketIds)', {
        ticketIds: ticketIdsArray,
      })
      .andWhere('cita.estado IN (:...estados)', {
        estados: [
          EstadoCita.PENDIENTE,
          EstadoCita.EN_CAMINO,
          EstadoCita.REPROGRAMADA,
        ],
      })
      .getOne();

    if (ticketEnCitaActiva) {
      throw new ConflictException(
        'Uno o más tickets seleccionados ya se encuentran asociados a una cita activa (Pendiente o En Camino).',
      );
    }

    // 9. Instanciar la entidad
    const cita = this.citasRepository.create({
      fecha_programada: fechaProgramada,
      estado: EstadoCita.PENDIENTE,
      sucursal: { id_sucursal: citaData.id_sucursal } as any,
      soporte_insitu: soporteValido,
      tickets: tickets,
    });

    // 10. Persistir la cita
    await this.citasRepository.save(cita);

    return 'Cita creada exitosamente';
  }
}
