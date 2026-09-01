import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Citas_Soporte, EstadoCita } from '@/entities/Citas-Soporte.entity';
import { UpdateCitaDto } from '../dto/update-cita-dto';
import { Usuario } from '@/entities/Usuario.entity';

@Injectable()
export class UpdateCitaUseCase {
  constructor(
    @InjectRepository(Citas_Soporte)
    private readonly citasRepository: Repository<Citas_Soporte>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async execute(id: number, dto: UpdateCitaDto): Promise<String> {
    const cita = await this.citasRepository.findOne({
      where: { id_cita: id },
      relations: ['sucursal', 'soporte_insitu', 'tickets'],
    });

    if (!cita) {
      throw new NotFoundException(`La cita con ID #${id} no fue encontrada.`);
    }

    // Regla de negocio: Solo se pueden editar datos administrativos si la cita está Pendiente
    if (cita.estado !== EstadoCita.PENDIENTE) {
      throw new BadRequestException(
        `No se puede modificar una cita en estado '${cita.estado}'. Usa el flujo específico correspondiente.`,
      );
    }

    // Actualización opcional del Técnico asignado
    if (dto.id_soporte_insitu) {
      const nuevoSoporte = await this.usuarioRepository.findOne({
        where: {
          id_usuario: dto.id_soporte_insitu,
          rol: {
            id_rol: 3,
          },
        },
      });

      if (!nuevoSoporte) {
        throw new NotFoundException(
          `El usuario con ID #${dto.id_soporte_insitu} no existe o no cuenta con el rol SOPORTE_INSITU.`,
        );
      }

      cita.soporte_insitu = nuevoSoporte;
    }

    if (dto.observaciones !== undefined) {
      cita.observaciones = dto.observaciones;
    }

    await this.citasRepository.save(cita);

    return `La cita con ID #${id} ha sido actualizada exitosamente.`;
  }
}
