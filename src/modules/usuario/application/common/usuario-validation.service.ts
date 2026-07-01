import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '@/entities/Usuario.entity';
import { Rol } from '@/entities/Rol.entity';

@Injectable()
export class UsuarioValidationService {
    constructor(
        @InjectRepository(Usuario) private readonly usuarioRepo: Repository<Usuario>,
        @InjectRepository(Rol) private readonly rolRepo: Repository<Rol>,
    ) {}

    // Validar si un usuario existe por su ID
    async validateUserExists(userId: number): Promise<Usuario> {
        const user = await this.usuarioRepo.findOne({ where: { id_usuario: userId } });
        if (!user) throw new NotFoundException('Usuario no encontrado');
        return user;
    }

    // Validar si un rol existe por su nombre
    async validateRoleExists(roleName: string): Promise<Rol> {
        const role = await this.rolRepo.findOne({ where: { nombre: roleName } });
        if (!role) throw new NotFoundException(`El rol ${roleName} no existe`);
        return role;
    }

    // Validar si un correo electrónico es único, 
    // excluyendo un usuario específico (útil para actualizaciones de perfil)
    async validateEmailUnique(email: string, excludeUserId?: number): Promise<void> {
        const existingUser = await this.usuarioRepo.findOne({ where: { correo: email } });
        if (existingUser && existingUser.id_usuario !== excludeUserId) {
            throw new ConflictException('El correo ya está registrado por otro usuario');
        }
    }
}
