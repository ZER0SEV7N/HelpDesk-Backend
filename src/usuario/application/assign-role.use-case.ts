import { Injectable, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../../entities/Usuario.entity';
import { UsuarioValidationService } from './common/usuario-validation.service';

@Injectable()
export class AssignRoleUseCase {
    constructor(
        @InjectRepository(Usuario) private readonly usuarioRepo: Repository<Usuario>,
        private readonly validationService: UsuarioValidationService,
    ) {}

    async execute(targetUserId: number, newRoleName: string, userPayload: any) {
        const { role, clienteId } = userPayload;

        const targetUser = await this.usuarioRepo.findOne({ 
            where: { id_usuario: targetUserId },
            relations: ['rol']
        });
        if (!targetUser) throw new NotFoundException('Usuario no encontrado');

        if (role === 'CLIENTE_EMPRESA') {
            if (targetUser.id_cliente !== clienteId) {
                throw new UnauthorizedException('No puedes modificar roles de usuarios que pertenecen a otra empresa');
            }
            if (['ADMINISTRADOR', 'CLIENTE_EMPRESA'].includes(newRoleName)) {
                throw new BadRequestException('No puedes otorgar este nivel de acceso');
            }
            if (['ADMINISTRADOR', 'CLIENTE_EMPRESA'].includes(targetUser.rol.nombre)) {
                throw new UnauthorizedException('No tienes permisos para alterar el rol de este usuario');
            }
        }
        
        const nuevoRol = await this.validationService.validateRoleExists(newRoleName);
        targetUser.rol = nuevoRol;
        await this.usuarioRepo.save(targetUser);

        return { message: `Rol de usuario ${targetUser.nombre} actualizado a ${newRoleName}` };
    }
}