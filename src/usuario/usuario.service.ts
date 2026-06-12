//helpDesk-Backend/src/usuario/usuario.service.ts
//Servicio para manejar la logica de negocio relacionada con los usuarios
//Funcionalidades:
//1. Actualizar perfil del usuario (nombre, apellido, correo, telefono, contraseña)
//2. Eliminar cuenta del usuario (cambiar estado a inactivo) Solo Admin
//3. Obtener perfil del usuario
//4. Listar usuarios (Solo Admin)
//5. Asignar rol a un usuario (Solo Admin)
//Importaciones necesarias:
import { Injectable, NotFoundException, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../entities/Usuario.entity';
import { Sucursales } from 'src/entities/Sucursales.entity';
import { Clientes } from 'src/entities/Clientes.entity';
import { UpdateProfileDTO } from './dto/update-profile.dto';
import { Rol } from '../entities/Rol.entity';
import { RegisterEmployeeDto } from './dto/register-employee.dto';
import { ReassignUserDto } from './dto/reassign-user.dto';
import { GetUsersFilterDto } from './dto/get-user-filter.dto';
import { UserResponseDto } from './dto/user-response.dto';

//Servicio para manejar la logica de negocio relacionada con los usuarios
@Injectable()
export class UsuarioService {
    constructor(
        @InjectRepository(Usuario) private usuarioRepo: Repository<Usuario>,
        @InjectRepository(Rol) private rolRepo: Repository<Rol>,
        @InjectRepository(Sucursales) private sucursalRepo: Repository<Sucursales>,
        @InjectRepository(Clientes) private clientesRepo: Repository<Clientes>,
    ) {}

    


    //Metodo para actualizar el perfil del usuario
    //PATCH /usuario/profile
    //TODOS los usuarios pueden actualizar su perfil, pero deben proporcionar su contraseña actual para validar su identidad
    async updateProfile(userId: number, dto: UpdateProfileDTO) {
        const user = await this.validateUserExists(userId);

        //Validar contraseña actual
        const isPasswordValid = await bcrypt.compare(dto.currentPassword, user.contraseña);
        if (!isPasswordValid) throw new UnauthorizedException('Contraseña actual incorrecta');

        //Si se proporciona nueva contraseña, encriptarla
        if (dto.nuevaContraseña) user.contraseña = await bcrypt.hash(dto.nuevaContraseña, 10);

        //Actualizar campos opcionales
        if (dto.nombre) user.nombre = dto.nombre;
        if (dto.apellido) user.apellido = dto.apellido;
        if (dto.correo) {
            //Verificar si el nuevo correo ya esta registrado por otro usuario
            await this.validateEmailUnique(dto.correo, userId);
            user.correo = dto.correo;
        }
        //Guardar los cambios
        await this.usuarioRepo.save(user);

        //Retornamos el usuario sin la contraseña por seguridad
        const { contraseña, ...result } = user;
        //Si se actualizo la contraseña, indicarlo en el mensaje de respuesta
        if (dto.nuevaContraseña) {
            return {
                message: 'Perfil y contraseña actualizados exitosamente',
                resultado: result,
            };
        }

        //Si no se actualizo la contraseña, retornar mensaje normal de perfil actualizado
        return {
            message: 'Perfil actualizado exitosamente',
            resultado: result,
        };
    }

    //Metodo para obtener el perfil del usuario
    //GET /usuario
    async getProfile(userId: number) {
        const user = await this.usuarioRepo.findOne({ where: { id_usuario: userId }, relations: ['rol'] });
        if (!user) throw new NotFoundException('Usuario no encontrado');
        //Retornamos el usuario sin la contraseña por seguridad
        const { contraseña, ...result } = user;
        return result;
    }

    //Metodo para listar todos los usuarios 
    //(Solo Cliente_Empresa y cliente_sucursal pueden listar solo los usuarios de su empresa o sucursal respectivamente)
    //GET /usuario/list
    async listUsers(userPayload: any, filters: GetUsersFilterDto): Promise<UserResponseDto[]> {
        //Construir la consulta base con los Joins necesarios
        const query = this.usuarioRepo.createQueryBuilder('user')
            .leftJoinAndSelect('user.rol', 'rol')
            .leftJoin('clientes', 'cliente', 'user.id_cliente = cliente.id_cliente')
            .leftJoin('sucursales', 'sucursal', 'user.id_sucursal = sucursal.id_sucursal')
            .select([
                'user.id_usuario',
                'user.nombre',
                'user.apellido',
                'user.correo',
                'user.telefono',
                'user.is_active',
                'user.created_at',
                'rol.id_rol',
                'rol.nombre',
                'cliente.nombre_principal',
                'sucursal.nombre_sucursal'
            ]);

        //Aplicar restricciones automáticas por Rol (Método Privado 1)
        this.applyRoleRestrictions(query, userPayload, filters);

        //Aplicar filtros dinámicos enviados por la UI (Método Privado 2)
        this.applyFilters(query, filters);

        //Ejecutar consulta y formatear la salida (Método Privado 3)
        return this.executeAndFormatUsers(query);
    }

    //Metodo para registrar un nuevo empleado (Solo Cliente_Empresa)
    //POST /usuario/register-employee
    async registerEmployee(dto: RegisterEmployeeDto, userPayload: any) {
        const { role, clienteId } = userPayload;
        
        //Validaciones de seguridad para CLIENTE_EMPRESA
        if (role === 'CLIENTE_EMPRESA') {
            //Auto-asignamos el ID de la empresa del creador
            dto.id_cliente = clienteId; 
            
            //Prohibimos que creen Administradores u otros Jefes de Empresa
            if (['ADMINISTRADOR', 'CLIENTE_EMPRESA'].includes(dto.rolNombre)) {
                throw new BadRequestException('No tienes permisos para crear usuarios con ese nivel de acceso');
            }
        }

        //Validaciones para crear el usuario.
        await this.validateEmailUnique(dto.correo);
        const rol = await this.validateRoleExists(dto.rolNombre);

        let cliente: Clientes | null = null;
        let sucursal: Sucursales | null = null;

        if (dto.id_cliente) {
            cliente = await this.clientesRepo.findOne({ where: { id_cliente: dto.id_cliente } });
            if (!cliente) throw new NotFoundException(`Cliente/Empresa con ID ${dto.id_cliente} no existe`);
        }

        if (dto.id_sucursal) {
            sucursal = await this.sucursalRepo.findOne({ where: { id_sucursal: dto.id_sucursal } });
            if (!sucursal) throw new NotFoundException(`Sucursal con ID ${dto.id_sucursal} no existe`);
            
            // Regla de negocio: La sucursal debe pertenecer a la empresa indicada
            if (cliente && sucursal.id_cliente !== cliente.id_cliente) 
                throw new BadRequestException('La sucursal indicada no pertenece a la empresa seleccionada');
        }

        //Encriptar contraseña
        const hashedPassword = await bcrypt.hash(dto.contraseña, 10);

        // Construir el objeto con tipado explicito Partial<Usuario> para evitar
        const userData: Partial<Usuario> = {
            nombre: dto.nombre,
            apellido: dto.apellido,
            correo: dto.correo,
            telefono: dto.telefono,
            contraseña: hashedPassword,
            rol: rol,
            id_cliente: cliente?.id_cliente ,   
            id_sucursal: sucursal?.id_sucursal, 
            is_active: true,
        };

        //Crear la instancia de la entidad y persistirla en la base de datos
        const newUser = this.usuarioRepo.create(userData);
        const savedUser = await this.usuarioRepo.save(newUser);

        //Retornar el nuevo usuario sin exponer la contraseña
        const { contraseña, ...result } = savedUser;
        return result;
    }

    //Metodo para asignar roles de manera manual
    //
    //PATCH /usuario/:id/rol
    //Jefes de Empresa pueden asignar roles a los usuarios de su empresa, 
    //pero no pueden otorgar permisos de ADMINISTRADOR ni crear otros CLIENTE_EMPRESA. Solo el ADMINISTRADOR general puede asignar cualquier rol.
    async assignRole(targetUserId: number, newRoleName: string, userPayload: any){
        const { role, clienteId } = userPayload;
        const targetUser = await this.usuarioRepo.findOne({ 
            where: { id_usuario: targetUserId },
            relations: ['rol']
        });
        if (!targetUser) throw new NotFoundException('Usuario no encontrado');

        //Validar la seguridad de la operación según el rol del usuario que hace la petición
        //Si el jefe de la empresa intenta asignar un rol, 
        //solo puede asignar roles inferiores a CLIENTE_EMPRESA y solo a usuarios de su propia empresa. 
        //No puede alterar roles de otros jefes ni de administradores.
        if (role === 'CLIENTE_EMPRESA') {
            if (targetUser.id_cliente !== clienteId) 
                throw new UnauthorizedException('No puedes modificar roles de usuarios que pertenecen a otra empresa');
            
            if (['ADMINISTRADOR', 'CLIENTE_EMPRESA'].includes(newRoleName)) 
                throw new BadRequestException('No puedes otorgar este nivel de acceso');
            
            if (['ADMINISTRADOR', 'CLIENTE_EMPRESA'].includes(targetUser.rol.nombre)) 
                throw new UnauthorizedException('No tienes permisos para alterar el rol de este usuario');
            
        }
        
        const nuevoRol = await this.validateRoleExists(newRoleName);
        targetUser.rol = nuevoRol;
        await this.usuarioRepo.save(targetUser);
        return { message: `Rol de usuario ${targetUser.nombre} actualizado a ${newRoleName}` };
    }

    //Metodo para desactivar la cuenta de un usuario (Solo Admin)
    //PATCH /usuario/:id/deactivate
    async deactivateUser(targetUserId: number, userPayload: any) {
        const { role, clienteId, userId: requesterId } = userPayload;

        const targetUser = await this.usuarioRepo.findOne({ 
            where: { id_usuario: targetUserId },
            relations: ['rol']
        });
        if (!targetUser) throw new NotFoundException('Usuario no encontrado');

        // Evitar que el usuario se desactive a sí mismo (Previene bloqueos accidentales)
        if (targetUserId === requesterId) {
            throw new BadRequestException('No puedes desactivar tu propia cuenta. Si deseas hacerlo, contacta a soporte.');
        }

        // Reglas de seguridad para CLIENTE_EMPRESA
        if (role === 'CLIENTE_EMPRESA') {
            // Solo puede desactivar a empleados de SU propia empresa
            if (targetUser.id_cliente !== clienteId) {
                throw new UnauthorizedException('No puedes desactivar usuarios que pertenecen a otra empresa');
            }
            // No puede desactivar al Administrador ni a otros Gerentes (CLIENTE_EMPRESA)
            if (['ADMINISTRADOR', 'CLIENTE_EMPRESA'].includes(targetUser.rol.nombre)) {
                throw new UnauthorizedException('No tienes permisos para desactivar cuentas con este nivel de acceso');
            }
        }

        // Si ya está inactivo, no hacemos nada extra para ahorrar recursos
        if (!targetUser.is_active) throw new BadRequestException('El usuario ya se encuentra desactivado');

        targetUser.is_active = false;
        await this.usuarioRepo.save(targetUser);
        
        return { message: `Cuenta del usuario ${targetUser.nombre} desactivada` };
    }

    //Metodo para reactivar la cuenta de un usuario (Solo Admin)
    //PATCH /usuario/:id/activate
    async activateUser(targetUserId: number, userPayload: any) {
        const { role, clienteId } = userPayload;

        const targetUser = await this.usuarioRepo.findOne({ 
            where: { id_usuario: targetUserId },
            relations: ['rol']
        });
        if (!targetUser) throw new NotFoundException('Usuario no encontrado');

        // Reglas de seguridad para CLIENTE_EMPRESA
        if (role === 'CLIENTE_EMPRESA') {
            if (targetUser.id_cliente !== clienteId) {
                throw new UnauthorizedException('No puedes reactivar usuarios que pertenecen a otra empresa');
            }
            if (['ADMINISTRADOR', 'CLIENTE_EMPRESA'].includes(targetUser.rol.nombre)) {
                throw new UnauthorizedException('No tienes permisos para reactivar cuentas con este nivel de acceso');
            }
        }

        // Si ya está activo, avisamos
        if (targetUser.is_active) throw new BadRequestException('El usuario ya se encuentra activo');

        targetUser.is_active = true;
        await this.usuarioRepo.save(targetUser);
        
        return { message: `Cuenta del usuario ${targetUser.nombre} reactivada` };
    }

    //Metodo para reasignar un usuario a otra empresa o sucursal (Solo Admin)
    //PATCH /usuario/:id/reassign
    async reassignUser(userId: number, dto: ReassignUserDto, userPayload: any) {
        const { role, clienteId } = userPayload;
        const targetUser = await this.usuarioRepo.findOne({ 
            where: { id_usuario: userId },
            relations: ['rol'] 
        });
        if (!targetUser) throw new NotFoundException('Usuario no encontrado');
    
        if(targetUser.rol.nombre === 'ADMINISTRADOR') 
            throw new BadRequestException('No se puede reasignar a un usuario con rol ADMINISTRADOR');
        
        //Validar la seguridad de la operación según el rol del usuario que hace la petición
        if (role === 'CLIENTE_EMPRESA') {
            //Solo pueden reasignar usuarios que pertenecen a su propia empresa
            if (targetUser.id_cliente !== clienteId) 
                throw new UnauthorizedException('No puedes reasignar usuarios que pertenecen a otra empresa');
            
            
            //No puede transferir su personal a otras empresas
            if (dto.id_cliente && dto.id_cliente !== clienteId) {
                throw new BadRequestException('No tienes permisos para transferir usuarios a otras empresas');
            }

            //Forzamos que, si es gerente, la empresa objetivo sea siempre la suya
            dto.id_cliente = clienteId; 
        }

        //Si se proporciona id_cliente, validar que exista y asignarlo al usuario. 
        //Si el usuario es gerente de empresa, no puede cambiar a otra empresa.
        if(dto.id_cliente){
            const cliente = await this.clientesRepo.findOne({ where: { id_cliente: dto.id_cliente } });
            if(!cliente) throw new NotFoundException(`Cliente/Empresa con ID ${dto.id_cliente} no existe`);
            
            targetUser.id_cliente = cliente.id_cliente;

            if(!dto.id_sucursal && role === 'ADMINISTRADOR') {
                targetUser.id_sucursal = undefined; 
            }
        }

        //Si se proporciona id_sucursal, validar que exista y asignarlo al usuario.
        if(dto.id_sucursal){
            const sucursal = await this.sucursalRepo.findOne({ where: { id_sucursal: dto.id_sucursal } });
            if(!sucursal) throw new NotFoundException(`Sucursal con ID ${dto.id_sucursal} no existe`);
            
            const targetClienteId = dto.id_cliente || targetUser.id_cliente; 
            
            if(sucursal.id_cliente !== targetClienteId) {
                throw new BadRequestException('La sucursal indicada no pertenece a la empresa de este usuario');
            }
            targetUser.id_sucursal = sucursal.id_sucursal;
        }

        //Guardar los cambios en la base de datos
        await this.usuarioRepo.save(targetUser);
        const { contraseña, ...result } = targetUser;
        return { message: `Usuario ${targetUser.nombre} reasignado exitosamente`,
                 user: result
        };
    }

    //Metodos de Validaciones
    //Validar si el usuario existe
    private async validateUserExists(userId: number): Promise<Usuario> {
        const user = await this.usuarioRepo.findOne({ where: { id_usuario: userId } });
        if (!user) throw new NotFoundException('Usuario no encontrado');
        return user;
    }

    //Validar si el rol existe
    private async validateRoleExists(roleName: string): Promise<Rol> {
        const role = await this.rolRepo.findOne({ where: { nombre: roleName } });
        if (!role) throw new NotFoundException(`El rol ${roleName} no existe`);
        return role;
    }

    //Validar que el email no este registrado por otro usuario
    private async validateEmailUnique(email: string, excludeUserId?: number): Promise<void> {
        const existingUser = await this.usuarioRepo.findOne({ where: { correo: email } });
        if (existingUser && existingUser.id_usuario !== excludeUserId) 
            throw new ConflictException('El correo ya está registrado por otro usuario');
    }

    //METODOS PRIVADOS UNICAMENTE PARA hacer el LISTADO DE USUARIOS con filtros y restricciones de seguridad

    //Metodo para aplicar las restricciones automáticas por rol (Admin ve todo, Cliente_Empresa ve solo su empresa, Cliente_Sucursal ve solo su sucursal)
    private applyRoleRestrictions(query: any, userPayload: any, filters: GetUsersFilterDto): void {
        //Extraemos la información relevante del payload del usuario 
        //para aplicar las restricciones
        const { role, clienteId, sucursalId } = userPayload;

        //Aplicamos las restricciones de seguridad según el rol del 
        //usuario que hace la petición
        switch(role) {
            case 'ADMINISTRADOR':
                //Si el admin no define filtros específicos en la UI, acotamos la vista inicial
                if (!filters.cliente && !filters.sucursal && !filters.id_usuario && !filters.nombre) {
                    query.andWhere('rol.nombre IN (:...rolesAdmin)', { 
                        rolesAdmin: ['ADMINISTRADOR', 'SOPORTE_TECNICO', 'SOPORTE_INSITU', 'CLIENTE_EMPRESA'] 
                    });
                }
                break;
            //Los jefes de empresa solo pueden ver a los usuarios que pertenecen a su empresa, sin importar la sucursal.
            case 'CLIENTE_EMPRESA':
                query.andWhere('user.id_cliente = :clienteId', { clienteId });
                break;
            //Los jefes de sucursal solo pueden ver a los usuarios que pertenecen a su sucursal, sin importar la empresa (en caso de que haya varias empresas con sucursales del mismo nombre)
            case 'CLIENTE_SUCURSAL':
                query.andWhere('user.id_sucursal = :sucursalId', { sucursalId });
                break;
            default:
                throw new UnauthorizedException('No tienes permisos para listar usuarios');
        }
    }

    //Metodo para inyectar los filtros dinámicos enviados por la UI (id_usuario, rolNombre, nombre, cliente, sucursal)
    private applyFilters(query: any, filters: GetUsersFilterDto): void {
        //Para el filtro de ID de usuario, permitimos búsqueda exacta
        if (filters.id_usuario) 
            query.andWhere('user.id_usuario = :idUsuario', { idUsuario: filters.id_usuario });
        
        //Para el filtro de rol, 
        //permitimos buscar por nombre de rol usando el alias definido en el Join
        if (filters.rolNombre) 
            query.andWhere('rol.nombre = :rolNombre', { rolNombre: filters.rolNombre });
        
        //Para el filtro de nombre, 
        //permitimos búsqueda parcial tanto en nombre como en apellido usando LIKE
        if (filters.nombre) 
            query.andWhere('(user.nombre LIKE :nombre OR user.apellido LIKE :nombre)', { 
                nombre: `%${filters.nombre}%` 
            });
    
        //Para los filtros de cliente y sucursal, 
        //permitimos búsqueda parcial usando LIKE en los nombres de las entidades relacionadas
        if (filters.cliente) 
            query.andWhere('cliente.nombre_principal LIKE :cliente', { cliente: `%${filters.cliente}%` });
        

        if (filters.sucursal) 
            query.andWhere('sucursal.nombre_sucursal LIKE :sucursal', { sucursal: `%${filters.sucursal}%` });
    }

    //Metodo para ejecutar la consulta y formatear la 
    //salida en un array de UserResponseDto
    private async executeAndFormatUsers(query: any): Promise<UserResponseDto[]> {
        //Ejecutamos la consulta y obtenemos tanto los resultados 
        //crudos como las entidades para mapear correctamente los campos personalizados
        const rawUsers = await query.getRawAndEntities();

        //Mapeamos los resultados a UserResponseDto, extrayendo los campos personalizados de los 
        //resultados crudos usando los aliases definidos en el Join
        return rawUsers.entities.map((user, index) => {
            const rawResult = rawUsers.raw[index];
            return {
                id_usuario: user.id_usuario,
                nombre: user.nombre,
                apellido: user.apellido,
                correo: user.correo,
                telefono: user.telefono,
                is_active: user.is_active,
                rol: {
                    id_rol: user.rol.id_rol,
                    nombre: user.rol.nombre
                },
                //Extrae dinámicamente las cadenas asignadas por los aliases 
                //internos del ORM
                empresa_nombre: rawResult.cliente_nombre_principal || null,
                sucursal_nombre: rawResult.sucursal_nombre_sucursal || null,
                created_at: user.created_at
            };
        });
    }

}
