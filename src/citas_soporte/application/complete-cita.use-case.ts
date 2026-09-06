// src/citas_soporte/application/complete-cita.use-case.ts
import { Citas_Soporte, EstadoCita } from '@/entities/Citas-Soporte.entity';
import { Usuario } from '@/entities/Usuario.entity';
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompleteCitaDto } from '../dto/complete-cita.dto';
import { TicketStatus } from '@/entities/Tickets.entity';
import { JwtPayload } from '@/common/guards/jwt-auth.guard';

@Injectable()
export class CompleteCitaUseCase {
  constructor(
    @InjectRepository(Citas_Soporte)
    private readonly citasRepository: Repository<Citas_Soporte>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async execute(
    id_cita: number,
    user: JwtPayload,
    dto: CompleteCitaDto,
  ): Promise<string> {
    // Obtener la cita por su ID
    const cita = await this.citasRepository.findOne({
      where: { id_cita },
      relations: ['soporte_insitu', 'tickets'],
    });
    // Validar que la cita exista
    if (!cita) throw new NotFoundException(`La cita #${id_cita} no existe.`);
    // Solo se puede completar si ya está En Camino o Pendiente
    if (
      cita.estado !== EstadoCita.EN_CAMINO &&
      cita.estado !== EstadoCita.PENDIENTE
    ) {
      throw new BadRequestException(
        `No se puede completar una cita con estado ${cita.estado}.`,
      );
    }
    // Obtenemos el usuario
    const usuario = await this.usuarioRepository.findOne({
      where: { id_usuario: user.userId },
      relations: ['rol'],
    });
    // Validar que el usuario exista
    if (!usuario)
      throw new NotFoundException(
        `El usuario #${user.userId} no fue encontrado.`,
      );
    // Validación de Permisos
    const esSoporteAsignado = cita.soporte_insitu?.id_usuario === user.userId;
    const esAdmin = usuario.rol?.nombre === 'ADMINISTRADOR';
    // Si el usuario no es el soporte asignado ni un administrador, se lanza una excepción
    if (!esSoporteAsignado && !esAdmin) {
      throw new ForbiddenException(
        `No tienes permisos para completar la cita #${id_cita}.`,
      );
    }
    // Actualizar la cita
    cita.estado = EstadoCita.COMPLETADA;
    cita.observaciones = dto.observaciones_cierre
      ? `${cita.observaciones || ''} | [CIERRE]: ${dto.observaciones_cierre}`.trim()
      : cita.observaciones;
    // Cerrar automáticamente los tickets asociados
    if (cita.tickets && cita.tickets.length > 0) {
      cita.tickets.forEach((ticket) => {
        ticket.estado = TicketStatus.CERRADO;
      });
    }
    // Guardar los cambios en la base de datos
    await this.citasRepository.save(cita);
    // Retornar un mensaje de éxito
    return 'Cita completada y tickets asociados cerrados exitosamente.';
  }
}
