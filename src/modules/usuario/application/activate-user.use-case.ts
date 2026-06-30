import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '@/entities/Usuario.entity';

@Injectable()
export class ActivateUserUseCase {
    constructor(
        @InjectRepository(Usuario) private readonly usuarioRepo: Repository<Usuario>,
    ) {}

    async execute(targetUserId: number, userPayload: any) {
        const { role, clienteId } = userPayload;

        const targetUser = await this.usuarioRepo.findOne({
            where: { id_usuario: targetUserId },
            relations: ['rol'],
        });
        if (!targetUser) throw new NotFoundException('Usuario no encontrado');

        if (role === 'CLIENTE_EMPRESA') {
            if (targetUser.id_cliente !== clienteId) {
                throw new UnauthorizedException('No puedes reactivar usuarios que pertenecen a otra empresa');
            }
            if (['ADMINISTRADOR', 'CLIENTE_EMPRESA'].includes(targetUser.rol.nombre)) {
                throw new UnauthorizedException('No tienes permisos para reactivar cuentas con este nivel de acceso');
            }
        }

        if (targetUser.is_active) throw new BadRequestException('El usuario ya se encuentra activo');

        targetUser.is_active = true;
        await this.usuarioRepo.save(targetUser);

        return { message: `Cuenta del usuario ${targetUser.nombre} reactivada` };
    }
}
