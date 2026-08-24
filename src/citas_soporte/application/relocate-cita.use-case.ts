// src/citas_soporte/application/relocate-cita.use-case.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Citas_Soporte, EstadoCita } from '@/entities/Citas-Soporte.entity';
import { RelocateCitaDto } from '../dto/relocate-cita.dto';

@Injectable()
export class RelocateCitaUseCase {
  constructor(
    @InjectRepository(Citas_Soporte)
    private readonly citasRepository: Repository<Citas_Soporte>,
    private readonly dataSource: DataSource,
  ) {}

  async execute(dto: RelocateCitaDto, id_cita_actual: number) {
    return await this.dataSource.transaction(async (manager) => {
      // 1. Buscar la cita original con sus relaciones
      const citaOriginal = await manager.findOne(Citas_Soporte, {
        where: { id_cita: id_cita_actual },
        relations: ['sucursal', 'soporte_insitu', 'tickets'],
      });

      if (!citaOriginal) {
        throw new NotFoundException(
          `La cita con ID #${id_cita_actual} no fue encontrada.`,
        );
      }

      if (
        ['Completada', 'Cancelada', 'Reprogramada'].includes(
          citaOriginal.estado,
        )
      ) {
        throw new BadRequestException(
          `No se puede reprogramar una cita en estado ${citaOriginal.estado}.`,
        );
      }

      // 2. Congelar la cita actual como Histórica
      citaOriginal.estado = EstadoCita.REPROGRAMADA;
      citaOriginal.observaciones = citaOriginal.observaciones
        ? `${citaOriginal.observaciones}\n[Motivo Reprogramación]: ${dto.motivo_reprogramacion}`
        : `[Motivo Reprogramación]: ${dto.motivo_reprogramacion}`;

      await manager.save(citaOriginal);

      // 3. Crear la NUEVA cita agendada con la nueva fecha
      const nuevaCita = manager.create(Citas_Soporte, {
        fecha_programada: new Date(dto.nueva_fecha_programada),
        estado: EstadoCita.PENDIENTE,
        sucursal: citaOriginal.sucursal,
        soporte_insitu: citaOriginal.soporte_insitu,
        tickets: citaOriginal.tickets, // Transfieres los tickets a la nueva cita activa
      });

      const citaGuardada = await manager.save(nuevaCita);

      return {
        mensaje:
          'Cita reprogramada exitosamente. Se generó un nuevo agendamiento.',
        cita_historica_id: citaOriginal.id_cita,
        nueva_cita: citaGuardada,
      };
    });
  }
}
