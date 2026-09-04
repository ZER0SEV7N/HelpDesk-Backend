// src/citas_soporte/application/add-tickets-to-cita.use-case.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Citas_Soporte, EstadoCita } from '@/entities/Citas-Soporte.entity';
import { Tickets } from '@/entities/Tickets.entity';
import { AddTicketsToCitaDto } from '../dto/add-tickets-to-cita.dto';

@Injectable()
export class AddTicketsToCitaUseCase {
  constructor(
    @InjectRepository(Citas_Soporte)
    private readonly citasRepository: Repository<Citas_Soporte>,
    @InjectRepository(Tickets)
    private readonly ticketsRepository: Repository<Tickets>,
  ) {}

  async execute(id_cita: number, dto: AddTicketsToCitaDto): Promise<String> {
    const cita = await this.citasRepository.findOne({
      where: { id_cita },
      relations: ['tickets', 'sucursal'],
    });

    if (!cita) {
      throw new NotFoundException(`La cita #${id_cita} no existe.`);
    }

    if (cita.estado !== EstadoCita.PENDIENTE) {
      throw new BadRequestException(
        `Solo se pueden asociar tickets a citas en estado '${EstadoCita.PENDIENTE}'.`,
      );
    }

    const nuevosTicketIds = Array.from(dto.ticket_ids);

    // 1. Obtener los tickets desde la BD
    const ticketsNuevos = await this.ticketsRepository.findBy({
      id_ticket: In(nuevosTicketIds),
    });

    if (ticketsNuevos.length !== nuevosTicketIds.length) {
      throw new NotFoundException('Uno o más tickets no fueron encontrados.');
    }

    // 2. Validar que no estén cerrados
    const ticketCerrado = ticketsNuevos.find(
      (t: any) => t.estado === 'Cerrado',
    );
    if (ticketCerrado) {
      throw new BadRequestException(
        `El ticket #${ticketCerrado.id_ticket} está Cerrado y no se puede asociar.`,
      );
    }

    // 3. Validar que no estén asignados a otra cita activa
    const ticketEnUso = await this.citasRepository
      .createQueryBuilder('cita')
      .innerJoin('cita.tickets', 'ticket')
      .where('ticket.id_ticket IN (:...ids)', { ids: nuevosTicketIds })
      .andWhere('cita.estado IN (:...estados)', {
        estados: [EstadoCita.PENDIENTE, EstadoCita.EN_CAMINO],
      })
      .getOne();

    if (ticketEnUso) {
      throw new ConflictException(
        'Uno o más tickets ya se encuentran asociados a otra cita activa.',
      );
    }

    // 4. Concatenar y actualizar
    const ticketsMap = new Map();
    cita.tickets.forEach((t) => ticketsMap.set(t.id_ticket, t));
    ticketsNuevos.forEach((t) => ticketsMap.set(t.id_ticket, t));

    cita.tickets = Array.from(ticketsMap.values());

    await this.citasRepository.save(cita);

    return 'Tickets asociados exitosamente a la cita.';
  }
}
