import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '@/entities/Usuario.entity';
import { Clientes } from '@/entities/Clientes.entity';
import { Sucursales } from '@/entities/Sucursales.entity';
import { ReassignUserDto } from '../dto/reassign-user.dto';

@Injectable()
export class ReassignUserUseCase {
    constructor(
        @InjectRepository(Usuario) private readonly usuarioRepo: Repository<Usuario>,
        @InjectRepository(Clientes) private readonly clientesRepo: Repository<Clientes>,
        @InjectRepository(Sucursales) private readonly sucursalRepo: Repository<Sucursales>,
    ) {}

    async execute(userId: number, dto: ReassignUserDto, userPayload: any) {
        const { role, clienteId } = userPayload;

        const targetUser = await this.usuarioRepo.findOne({
            where: { id_usuario: userId },
            relations: ['rol'],
        });
        if (!targetUser) throw new NotFoundException('Usuario no encontrado');

        if (targetUser.rol.nombre === 'ADMINISTRADOR') {
            throw new BadRequestException('No se puede reasignar a un usuario con rol ADMINISTRADOR');
        }

        if (role === 'CLIENTE_EMPRESA') {
            if (targetUser.id_cliente !== clienteId) {
                throw new UnauthorizedException('No puedes reasignar usuarios que pertenecen a otra empresa');
            }
            if (dto.id_cliente && dto.id_cliente !== clienteId) {
                throw new BadRequestException('No tienes permisos para transferir usuarios a otras empresas');
            }
            dto.id_cliente = clienteId;
        }

        if (dto.id_cliente) {
            const cliente = await this.clientesRepo.findOne({ where: { id_cliente: dto.id_cliente } });
            if (!cliente) throw new NotFoundException(`Cliente/Empresa con ID ${dto.id_cliente} no existe`);

            targetUser.id_cliente = cliente.id_cliente;
            if (!dto.id_sucursal && role === 'ADMINISTRADOR') {
                targetUser.id_sucursal = undefined;
            }
        }

        if (dto.id_sucursal) {
            const sucursal = await this.sucursalRepo.findOne({ where: { id_sucursal: dto.id_sucursal } });
            if (!sucursal) throw new NotFoundException(`Sucursal con ID ${dto.id_sucursal} no existe`);

            const targetClienteId = dto.id_cliente || targetUser.id_cliente;
            if (sucursal.id_cliente !== targetClienteId) {
                throw new BadRequestException('La sucursal indicada no pertenece a la empresa de este usuario');
            }
            targetUser.id_sucursal = sucursal.id_sucursal;
        }

        await this.usuarioRepo.save(targetUser);
        const { contraseña, ...result } = targetUser;

        return {
            message: `Usuario ${targetUser.nombre} reasignado exitosamente`,
            user: result,
        };
    }
}
