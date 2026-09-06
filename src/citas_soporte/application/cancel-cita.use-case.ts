import { Citas_Soporte, EstadoCita } from '@/entities/Citas-Soporte.entity';
import { Usuario } from '@/entities/Usuario.entity';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CancelCitaDto } from '../dto/cancel-cita.dto';
import { JwtPayload } from '@/common/guards/jwt-auth.guard';

@Injectable()
export class CancelCitaUseCase {
  constructor(
    @InjectRepository(Citas_Soporte)
    private readonly citasRepository: Repository<Citas_Soporte>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async execute(
    id_cita: number,
    user: JwtPayload,
    dto: CancelCitaDto,
  ): Promise<string> {
    // Obtener la cita por su ID
    const cita = await this.citasRepository.findOne({
      where: { id_cita },
      relations: ['tickets', 'sucursal', 'soporte_insitu'],
    });
    // Validar que la cita exista
    if (!cita) {
      throw new Error(`La cita #${id_cita} no existe.`);
    }
    // Validar que la cita esté en estado PENDIENTE
    if (cita.estado !== EstadoCita.PENDIENTE) {
      throw new Error(
        `La cita #${id_cita} no puede ser cancelada porque no está en estado PENDIENTE.`,
      );
    }
    // Obtenemos el usuario
    const usuario = await this.usuarioRepository.findOne({
      where: { id_usuario: user.userId },
    });
    // Validar que el usuario exista
    if (!usuario) throw new Error(`El usuario #${user.userId} no existe.`);
    // Comprobar permisos
    const esSoporteAsignado = cita.soporte_insitu?.id_usuario === user.userId;
    const esAdmin = usuario.rol?.nombre === 'ADMINISTRADOR';
    if (!esSoporteAsignado && !esAdmin) {
      throw new ForbiddenException(
        `No tienes permisos para cancelar la cita #${id_cita}. Solo el soporte asignado o un Administrador pueden hacerlo.`,
      );
    }
    // Cambiar el estado de la cita a CANCELADA
    cita.estado = EstadoCita.CANCELADA;
    // Agregar el motivo de cancelación a las observaciones
    cita.observaciones = cita.observaciones
      ? `${cita.observaciones} | [CANCELADA]: ${dto.motivo_cancelacion}`
      : `[CANCELADA]: ${dto.motivo_cancelacion}`;
    // Limpiar los tickets asociados a la cita
    cita.tickets = [];
    // Guardar los cambios en la base de datos
    await this.citasRepository.save(cita);
    // Retornar un mensaje de éxito
    return 'Cita cancelada exitosamente';
  }
}
