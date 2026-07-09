import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from '@/entities/Usuario.entity';
import { UpdateProfileDTO } from '../dto/update-profile.dto';
import { UsuarioValidationService } from './common/usuario-validation.service';

@Injectable()
export class UpdateProfileUseCase {
    constructor(
        @InjectRepository(Usuario) private readonly usuarioRepo: Repository<Usuario>,
        private readonly validationService: UsuarioValidationService,
    ) {}

    async execute(userId: number, dto: UpdateProfileDTO) {
        const user = await this.validationService.validateUserExists(userId);

        const isPasswordValid = await bcrypt.compare(dto.currentPassword, user.password);
        if (!isPasswordValid) throw new UnauthorizedException('Contraseña actual incorrecta');

        if (dto.newPassword) user.password = await bcrypt.hash(dto.newPassword, 10);
        if (dto.nombre) user.nombre = dto.nombre;
        if (dto.apellido) user.apellido = dto.apellido;
        if (dto.telefono) user.telefono = dto.telefono;

        await this.usuarioRepo.save(user);
        const { password, ...result } = user;

        return {
            message: dto.newPassword
                ? 'Perfil y contraseña actualizados exitosamente'
                : 'Perfil actualizado exitosamente',
            resultado: result,
        };
    }
}
