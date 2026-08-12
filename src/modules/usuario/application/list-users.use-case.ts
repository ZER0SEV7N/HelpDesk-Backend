import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '@/entities/Usuario.entity';
import { GetUsersFilterDto } from '../dto/get-users-filter.dto';
import { UserResponseDto } from '../dto/user-response.dto';

@Injectable()
export class ListUsersUseCase {
    constructor(
        @InjectRepository(Usuario) private readonly usuarioRepo: Repository<Usuario>,
    ) {}

    async execute(userPayload: any, filters: GetUsersFilterDto): Promise<UserResponseDto[]> {
        const query = this.usuarioRepo.createQueryBuilder('user')
            .leftJoinAndSelect('user.rol', 'rol')
            .leftJoin('clientes', 'cliente', 'user.id_cliente = cliente.id_cliente')
            .leftJoin('sucursales', 'sucursal', 'user.id_sucursal = sucursal.id_sucursal')
            .select([
                'user.id_usuario', 'user.nombre', 'user.apellido', 'user.correo',
                'user.telefono', 'user.is_active', 'user.created_at',
                'rol.id_rol', 'rol.nombre',
                'cliente.nombre_principal', 'sucursal.nombre_sucursal',
            ]);

        this.applyRoleRestrictions(query, userPayload, filters);
        this.applyFilters(query, filters);

        const rawUsers = await query.getRawAndEntities();
        return rawUsers.entities.map((user, index) => {
            const rawResult = rawUsers.raw[index];
            return {
                id_usuario: user.id_usuario,
                nombre: user.nombre,
                apellido: user.apellido,
                correo: user.correo,
                telefono: user.telefono,
                is_active: user.is_active,
                rol: { id_rol: user.rol.id_rol, nombre: user.rol.nombre },
                empresa_nombre: rawResult.cliente_nombre_principal || null,
                sucursal_nombre: rawResult.sucursal_nombre_sucursal || null,
                created_at: user.created_at,
            };
        });
    }

    private applyRoleRestrictions(query: any, userPayload: any, filters: GetUsersFilterDto): void {
        const { role, clienteId } = userPayload;
        switch (role) {
            case 'ADMINISTRADOR':
                if (!filters.cliente && !filters.sucursal && !filters.id_usuario && !filters.nombre) {
                    query.andWhere('rol.nombre IN (:...rolesAdmin)', {
                        rolesAdmin: ['ADMINISTRADOR', 'SOPORTE_TECNICO', 'SOPORTE_INSITU', 'CLIENTE_EMPRESA'],
                    });
                }
                break;
            case 'CLIENTE_EMPRESA':
                query.andWhere('user.id_cliente = :clienteId', { clienteId });
                break;
            case 'CLIENTE_SUCURSAL':
                query.andWhere('user.id_sucursal = :sucursalId', { sucursalId: filters.sucursal });
                break;
            default:
                throw new UnauthorizedException('No tienes permisos para listar usuarios');
        }
    }

    private applyFilters(query: any, filters: GetUsersFilterDto): void {
        if (filters.id_usuario) query.andWhere('user.id_usuario = :idUsuario', { idUsuario: filters.id_usuario });
        if (filters.rolNombre) query.andWhere('rol.nombre = :rolNombre', { rolNombre: filters.rolNombre });
        if (filters.nombre) query.andWhere('(user.nombre LIKE :nombre OR user.apellido LIKE :nombre)', { nombre: `%${filters.nombre}%` });
        if (filters.cliente) query.andWhere('cliente.nombre_principal LIKE :cliente', { cliente: `%${filters.cliente}%` });
        if (filters.sucursal) query.andWhere('sucursal.nombre_sucursal LIKE :sucursal', { sucursal: `%${filters.sucursal}%` });
    }
}
