//src/modules/usuario/sub-services/usuario-profile.service.ts}
//SubServicio para manejar la logica de negocio relacionada con el perfil del usuario
//Funcionalidades:
//1. Actualizar perfil del usuario (nombre, apellido, correo, telefono, contraseña)
//2. Obtener perfil del usuario
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../../../entities/Usuario.entity';
import { UpdateProfileDTO } from '../dto/update-profile.dto';

@Injectable()
export class UsuarioProfileService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async getProfile(userId: number) {
    const user = await this.usuarioRepository.findOne({
      where: { id_usuario: userId },
      relations: ['rol'],
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const { contraseña: _contraseña, ...result } = user;
    return result;
  }

  async updateProfile(userId: number, dto: UpdateProfileDTO) {
    const user = await this.usuarioRepository.findOne({
      where: { id_usuario: userId },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const { currentPassword, nuevaContraseña, ...camposAActualizar } = dto;

    if (currentPassword) {
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.contraseña,
      );
      if (!isPasswordValid)
        throw new UnauthorizedException('Contraseña actual incorrecta');
    }

    if (nuevaContraseña)
      user.contraseña = await bcrypt.hash(nuevaContraseña, 10);

    Object.assign(user, camposAActualizar);
    await this.usuarioRepository.save(user);

    const { contraseña: _respuesta_contraseña, ...result } = user;
    return {
      message: nuevaContraseña
        ? 'Perfil y contraseña actualizados exitosamente'
        : 'Perfil actualizado exitosamente',
      resultado: result,
    };
  }
}
