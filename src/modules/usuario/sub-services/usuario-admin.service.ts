// src/usuario/sub-services/usuario-admin.service.ts
import { Injectable, NotFoundException, BadRequestException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from '@/entities/Usuario.entity';
import { Rol } from '@/entities/Rol.entity';
import { Clientes } from '@/entities/Clientes.entity';
import { Sucursales } from '@/entities/Sucursales.entity';
import { GetUsersFilterDto } from '../dto/get-users-filter.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { RegisterEmployeeDto } from '../dto/register-employee.dto';
import { ReassignUserDto } from '../dto/reassign-user.dto';
import { EmployeeRegistrationManager } from '../managers/employee-registration.manager';
import { CsvProcessorUtil } from '@/common/bulk-upload/csv-processor.util';

@Injectable()
export class UsuarioAdminService {
    constructor(
        @InjectRepository(Usuario) private readonly usuarioRepo: Repository<Usuario>,
        @InjectRepository(Rol) private readonly rolRepo: Repository<Rol>,
        @InjectRepository(Clientes) private readonly clientesRepo: Repository<Clientes>,
        @InjectRepository(Sucursales) private readonly sucursalRepo: Repository<Sucursales>,
        private readonly registrationManager: EmployeeRegistrationManager,
        private readonly csvProcessor: CsvProcessorUtil,
    ) {}

    /**
     * 1. LISTAR USUARIOS (Con filtros dinámicos y control de ámbito por Rol)
    */
    async listUsers(userPayload: any, filters: GetUsersFilterDto): Promise<UserResponseDto[]> {
        const query = this.usuarioRepo.createQueryBuilder('user')
            .leftJoinAndSelect('user.rol', 'rol')
            .leftJoin('clientes', 'cliente', 'user.id_cliente = cliente.id_cliente')
            .leftJoin('sucursales', 'sucursal', 'user.id_sucursal = sucursal.id_sucursal')
            .select([
            'user.id_usuario', 'user.nombre', 'user.apellido', 'user.correo',
            'user.telefono', 'user.is_active', 'user.created_at',
            'rol.id_rol', 'rol.nombre',
            'cliente.nombre_principal', 'sucursal.nombre_sucursal'
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
                created_at: user.created_at
            };
        });
    }

    /**
     * 2. REGISTRAR UN NUEVO EMPLEADO (Inicia el flujo transitorio por Redis)
    */
    async registerEmployee(dto: RegisterEmployeeDto, userPayload: any) {
        this.verifyCreationPermissions(dto, userPayload); //Verificar el rol

        //Evitar colisión inmediata si el correo ya existe en MySQL
        const emailExists = await this.usuarioRepo.findOne({ where: { correo: dto.correo } });
        if (emailExists) throw new ConflictException('El correo ya está registrado por otro usuario');

        //Validar que el rol objetivo exista antes de armar la estructura intermedia
        const rol = await this.rolRepo.findOne({ where: { nombre: dto.rolNombre } });
        if (!rol) throw new NotFoundException(`El rol ${dto.rolNombre} no existe`);

        //Validar la existencia de la jerarquía relacional (Empresa / Sucursal)
        await this.validateHierarchy(dto.id_cliente, dto.id_sucursal);

        //El manager lo guarda en Redis y dispara el mail + WebSocket
        return this.registrationManager.initiateVerification(dto, userPayload);
    }

    /**
     *CARGA MASIVA DE EMPLEADOS DESDE CSV
    */
    async registerBulkEmployees(fileBuffer: Buffer, userPayload: any) {
        const requiredHeaders = ['nombre', 'apellido', 'correo', 'telefono', 'contraseña', 'rolNombre', 'id_sucursal'];
        
        //Parsear el binario aislado usando el utilitario común
        const records = await this.csvProcessor.parseCsv<RegisterEmployeeDto>(fileBuffer, requiredHeaders);
        const summary: { exitosos: number; fallidos: number; errores: Array<{ correo: string; motivo: string }> } = { exitosos: 0, fallidos: 0, errores: [] };

        await Promise.all(
            records.map(async (record) => {
                try {
                await this.registerEmployee(record, userPayload);
                summary.exitosos++;
                } catch (err: any) {
                summary.fallidos++;
                summary.errores.push({ correo: record.correo, motivo: err.message });
                }
            })
        );

        return { message: 'Procesamiento de carga masiva finalizado', summary };
    }

    /**
     * CONFIRMACIÓN FINAL (Invocado por el controlador cuando llega el token verificado)
    */
    async saveFinalEmployee(correo: string, token: string) {
        //Confirmar el token y recuperar el DTO original desde Redis
        const validatedDto = await this.registrationManager.confirmEmail(correo, token);

        //Validar nuevamente la jerarquía relacional antes de persistir en MySQL
        const rol = await this.rolRepo.findOne({ where: { nombre: validatedDto.rolNombre } });
        const hashedPassword = await bcrypt.hash(validatedDto.password, 10);

        //Persistir el usuario en MySQL con la contraseña encriptada y el rol asignado
        const newUser = this.usuarioRepo.create({
            ...validatedDto,
            contraseña: hashedPassword,
            rol: rol!,
            is_active: true
        });

        const savedUser = await this.usuarioRepo.save(newUser);
        const { contraseña, ...result } = savedUser;
        return {
            message: `El empleado ${savedUser.nombre} ha sido verificado y guardado con éxito.`,
            user: result
        };
    }

    /**
     * 5. ASIGNAR ROL MANUALMENTE
    */
    async assignRole(targetUserId: number, newRoleName: string, userPayload: any) {
        if (targetUserId === userPayload.userId) throw new BadRequestException('No puedes alterar el estado de tu propia cuenta');
        
        const targetUser = await this.usuarioRepo.findOne({ where: { id_usuario: targetUserId }, relations: ['rol'] });
        if (!targetUser) throw new NotFoundException('Usuario no encontrado');

        const nuevoRol = await this.rolRepo.findOne({ where: { nombre: newRoleName } });
        if (!nuevoRol) throw new NotFoundException(`El rol ${newRoleName} no existe`);

        targetUser.rol = nuevoRol;
        await this.usuarioRepo.save(targetUser);
        return { message: `Rol de usuario ${targetUser.nombre} actualizado a ${newRoleName}` };
    }

    /**
     * 6. CAMBIAR ESTADO (Activar/Desactivar)
    */
    async changeStatus(targetUserId: number, activate: boolean, userPayload: any) {
        const { role, clienteId, userId: requesterId } = userPayload;
        const targetUser = await this.usuarioRepo.findOne({ where: { id_usuario: targetUserId }, relations: ['rol'] });
        if (!targetUser) throw new NotFoundException('Usuario no encontrado');

        if (targetUserId === requesterId) throw new BadRequestException('No puedes alterar el estado de tu propia cuenta');

        if (role === 'CLIENTE_EMPRESA') {
            if (targetUser.id_cliente !== clienteId) throw new UnauthorizedException('Usuario ajeno a tu empresa');
            if (['ADMINISTRADOR', 'CLIENTE_EMPRESA'].includes(targetUser.rol.nombre)) throw new UnauthorizedException('Nivel de acceso denegado');
        }

        if (targetUser.is_active === activate) throw new BadRequestException(`El usuario ya se encuentra ${activate ? 'activo' : 'desactivado'}`);

        targetUser.is_active = activate;
        await this.usuarioRepo.save(targetUser);
        return { message: `Cuenta del usuario ${targetUser.nombre} ${activate ? 'reactivada' : 'desactivada'}` };
    }

    /**
     * 7. REASIGNAR USUARIO A OTRA SUCURSAL / EMPRESA
    */
    async reassignUser(userId: number, dto: ReassignUserDto, userPayload: any) {
        const { role, clienteId } = userPayload;
        const targetUser = await this.usuarioRepo.findOne({ where: { id_usuario: userId }, relations: ['rol'] });
        if (!targetUser) throw new NotFoundException('Usuario no encontrado');
        if (targetUser.rol.nombre === 'ADMINISTRADOR') throw new BadRequestException('No se puede reasignar un ADMINISTRADOR');

        if (role === 'CLIENTE_EMPRESA') {
            if (targetUser.id_cliente !== clienteId) throw new UnauthorizedException('Usuario ajeno a tu empresa');
            if (dto.id_cliente && dto.id_cliente !== clienteId) throw new BadRequestException('No puedes transferir personal fuera de tu empresa');
            dto.id_cliente = clienteId;
        }

        //Validar el id_cliente y id_sucursal proporcionados antes de reasignar
        if (dto.id_cliente) {
            const cliente = await this.clientesRepo.findOne({ where: { id_cliente: dto.id_cliente } });
            if (!cliente) throw new NotFoundException('Empresa destino inexistente');
            targetUser.id_cliente = cliente.id_cliente;
            if (!dto.id_sucursal && role === 'ADMINISTRADOR') targetUser.id_sucursal = undefined;
        }

        if (dto.id_sucursal) {
            const sucursal = await this.sucursalRepo.findOne({ where: { id_sucursal: dto.id_sucursal } });
            if (!sucursal) throw new NotFoundException('Sucursal destino inexistente');
            const targetClienteId = dto.id_cliente || targetUser.id_cliente;
            if (sucursal.id_cliente !== targetClienteId) throw new BadRequestException('La sucursal no pertenece a la empresa de este usuario');
            targetUser.id_sucursal = sucursal.id_sucursal;
        }

        await this.usuarioRepo.save(targetUser);
        const { contraseña, ...result } = targetUser;
        return { message: `Usuario ${targetUser.nombre} reasignado exitosamente`, user: result };
    }

    // ----------------------------------------------------------------
    // REFACTORIZACIONES INTERNAS (MÉTODOS PRIVADOS DE CONTROL)
    // ----------------------------------------------------------------
    
    //Metodo privado para verificar si el usuario que intenta crear un nuevo empleado tiene permisos para asignar el rol indicado

    private verifyCreationPermissions(dto: RegisterEmployeeDto, userPayload: any): void {
        const { role, clienteId } = userPayload;
        if (role === 'CLIENTE_EMPRESA') {
            dto.id_cliente = clienteId; 
            if (['ADMINISTRADOR', 'CLIENTE_EMPRESA'].includes(dto.rolNombre)) throw new BadRequestException('No tienes permisos para crear usuarios con ese nivel de acceso');
        }
    }

    //Metodo privado para validar la jerarquía relacional (Empresa / Sucursal) antes de persistir en MySQL
    private async validateHierarchy(idCliente?: number, idSucursal?: number): Promise<void> {
        let cliente = idCliente ? await this.clientesRepo.findOne({ where: { id_cliente: idCliente } }) : null;
        let sucursal = idSucursal ? await this.sucursalRepo.findOne({ where: { id_sucursal: idSucursal } }) : null;

        if (idCliente && !cliente) throw new NotFoundException(`Empresa con ID ${idCliente} no existe`);
        if (idSucursal && !sucursal) throw new NotFoundException(`Sucursal con ID ${idSucursal} no existe`);
        if (cliente && sucursal && sucursal.id_cliente !== cliente.id_cliente)  throw new BadRequestException('La sucursal indicada no pertenece a la empresa seleccionada');
        
    }

    //Metodo privado para aplicar restricciones de rol al listar usuarios
    private applyRoleRestrictions(query: any, userPayload: any, filters: GetUsersFilterDto): void {
        const { role, clienteId } = userPayload;
        switch(role) {
        case 'ADMINISTRADOR':
            if (!filters.cliente && !filters.sucursal && !filters.id_usuario && !filters.nombre) {
                query.andWhere('rol.nombre IN (:...rolesAdmin)', { 
                    rolesAdmin: ['ADMINISTRADOR', 'SOPORTE_TECNICO', 'SOPORTE_INSITU', 'CLIENTE_EMPRESA'] 
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

    //Metodo privado para aplicar filtros dinámicos al listar usuarios
    private applyFilters(query: any, filters: GetUsersFilterDto): void {
        if (filters.id_usuario) query.andWhere('user.id_usuario = :idUsuario', { idUsuario: filters.id_usuario });
        if (filters.rolNombre) query.andWhere('rol.nombre = :rolNombre', { rolNombre: filters.rolNombre });
        if (filters.nombre) query.andWhere('(user.nombre LIKE :nombre OR user.apellido LIKE :nombre)', { nombre: `%${filters.nombre}%` });
        if (filters.cliente) query.andWhere('cliente.nombre_principal LIKE :cliente', { cliente: `%${filters.cliente}%` });
        if (filters.sucursal) query.andWhere('sucursal.nombre_sucursal LIKE :sucursal', { sucursal: `%${filters.sucursal}%` });
    }
}