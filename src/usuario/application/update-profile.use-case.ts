import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../../entities/Usuario.entity';
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

        if (dto.nuevaPassword) user.password = await bcrypt.hash(dto.nuevaPassword, 10);
        if (dto.nombre) user.nombre = dto.nombre;
        if (dto.apellido) user.apellido = dto.apellido;
        
        if (dto.correo) {
            await this.validationService.validateEmailUnique(dto.correo, userId);
            user.correo = dto.correo;
        }

        await this.usuarioRepo.save(user);
        const { password, ...result } = user;

        if (dto.nuevaPassword) {
            return {
                message: 'Perfil y contraseña actualizados exitosamente',
                resultado: result,
            };
        }

        return {
            message: 'Perfil actualizado exitosamente',
            resultado: result,
        };
    }
}