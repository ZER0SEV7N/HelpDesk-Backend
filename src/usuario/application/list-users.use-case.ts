import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../../entities/Usuario.entity';

@Injectable()
export class ListUsersUseCase {
    constructor(
        @InjectRepository(Usuario) private readonly usuarioRepo: Repository<Usuario>,
    ) {}

    async execute(userPayload: any) {
        const query = this.usuarioRepo.createQueryBuilder('user')
            .leftJoinAndSelect('user.rol', 'rol');

        if (userPayload.role === 'CLIENTE_EMPRESA') {
            query.where('user.id_cliente = :clienteId', { clienteId: userPayload.clienteId });
        } else if (userPayload.role === 'CLIENTE_SUCURSAL') {
            query.where('user.id_sucursal = :sucursalId', { sucursalId: userPayload.sucursalId });
        }

        const users = await query.getMany();
        return users.map((user) => {
            const { password, ...result } = user;
            return result;
        });
    }
}