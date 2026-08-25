// src/citas_soporte/application/start-cita.use-case.ts
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

@Injectable()
export class StartCitaUseCase {
  constructor(
    @InjectRepository(Citas_Soporte)
    private readonly citasRepository: Repository<Citas_Soporte>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async execute(id_cita: number, id_user: number): Promise<string> {
    // Obtener la cita por su ID
    const cita = await this.citasRepository.findOne({
      where: { id_cita },
      relations: ['soporte_insitu'],
    });
    // Validar que la cita exista
    if (!cita) throw new NotFoundException(`La cita #${id_cita} no existe.`);
    // Solo se puede pasar a En Camino si está en estado PENDIENTE
    if (cita.estado !== EstadoCita.PENDIENTE) {
      throw new BadRequestException(
        `Solo se pueden pasar a 'En Camino' citas en estado PENDIENTE. Estado actual: ${cita.estado}.`,
      );
    }
    // Obtenemos el usuario
    const usuario = await this.usuarioRepository.findOne({
      where: { id_usuario: id_user },
      relations: ['rol'],
    });
    // Validar que el usuario exista
    if (!usuario)
      throw new NotFoundException(`El usuario #${id_user} no fue encontrado.`);
    // Validación de Permisos
    const esSoporteAsignado = cita.soporte_insitu?.id_usuario === id_user;
    const esAdmin = usuario.rol?.nombre === 'ADMINISTRADOR';
    // Si el usuario no es el soporte asignado ni un administrador, se lanza una excepción
    if (!esSoporteAsignado && !esAdmin) {
      throw new ForbiddenException(
        `No tienes permisos para cambiar el estado de la cita #${id_cita}.`,
      );
    }
    // Actualizar la cita a estado En Camino
    cita.estado = EstadoCita.EN_CAMINO;
    // Guardar los cambios en la base de datos
    await this.citasRepository.save(cita);
    // Retornar un mensaje de éxito
    return 'Cita actualizada a estado En Camino.';
  }
}
