import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '@/entities/Usuario.entity';

@Injectable()
export class DeactivateUserUseCase {
    constructor(
        @InjectRepository(Usuario) private readonly usuarioRepo: Repository<Usuario>,
    ) {}

    async execute(targetUserId: number, userPayload: any) {
        const { role, clienteId, userId: requesterId } = userPayload;

        const targetUser = await this.usuarioRepo.findOne({
            where: { id_usuario: targetUserId },
            relations: ['rol'],
        });
        if (!targetUser) throw new NotFoundException('Usuario no encontrado');

        if (targetUserId === requesterId) {
            throw new BadRequestException('No puedes desactivar tu propia cuenta. Si deseas hacerlo, contacta a soporte.');
        }

        if (role === 'CLIENTE_EMPRESA') {
            if (targetUser.id_cliente !== clienteId) {
                throw new UnauthorizedException('No puedes desactivar usuarios que pertenecen a otra empresa');
            }
            if (['ADMINISTRADOR', 'CLIENTE_EMPRESA'].includes(targetUser.rol.nombre)) {
                throw new UnauthorizedException('No tienes permisos para desactivar cuentas con este nivel de acceso');
            }
        }

        if (!targetUser.is_active) throw new BadRequestException('El usuario ya se encuentra desactivado');

        targetUser.is_active = false;
        await this.usuarioRepo.save(targetUser);

        return { message: `Cuenta del usuario ${targetUser.nombre} desactivada` };
    }
}
