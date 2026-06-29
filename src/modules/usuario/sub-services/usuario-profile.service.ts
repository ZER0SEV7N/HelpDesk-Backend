//src/modules/usuario/sub-services/usuario-profile.service.ts}
//SubServicio para manejar la logica de negocio relacionada con el perfil del usuario
//Funcionalidades:
//1. Actualizar perfil del usuario (nombre, apellido, correo, telefono, contraseña)
//2. Obtener perfil del usuario
import { Injectable, NotFoundException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../../../entities/Usuario.entity';
import { UpdateProfileDTO } from '../dto/update-profile.dto';

@Injectable()
export class UsuarioProfileService {
    constructor(
        @InjectRepository(Usuario) private readonly usuarioRepository: Repository<Usuario>,
    ) {}

    //Metodo para obtener el perfil del usuario
    async getProfile(userId: number) {
        const user = await this.usuarioRepository.findOne({ where: { id_usuario: userId }, relations: ['rol'] });
        if(!user) throw new NotFoundException('Usuario no encontrado');

        const { contraseña, ...result} = user;
        return result;
    }

    //Metodo para actualizar el perfil del usuario
    async updateProfile(userId: number, dto: UpdateProfileDTO) {
        const user = await this.usuarioRepository.findOne({ where: { id_usuario: userId } });
        if (!user) throw new NotFoundException('Usuario no encontrado');

        //Validar identidad con la contraseña actual
        const isPasswordValid = await bcrypt.compare(dto.currentPassword, user.contraseña);
        if (!isPasswordValid) throw new UnauthorizedException('Contraseña actual incorrecta');

        //Extraer parámetros (Dejando de lado intencionalmente "currentPassword" y "nuevaContraseña")
        const { currentPassword, nuevaContraseña, ...camposAActualizar } = dto;

        //Si se solicita cambio de credenciales, se encripta de forma aislada
        if (nuevaContraseña) user.contraseña = await bcrypt.hash(nuevaContraseña, 10);
        
        //Asignación directa y limpia 
        Object.assign(user, camposAActualizar);
        //Persistir en Base de Datos
        await this.usuarioRepository.save(user);
        //Sanitizar la respuesta de salida para el Frontend
        const { contraseña, ...result } = user;
        return {
            message: nuevaContraseña ? 'Perfil y contraseña actualizados exitosamente' : 'Perfil actualizado exitosamente',
            resultado: result
        };
    }
}