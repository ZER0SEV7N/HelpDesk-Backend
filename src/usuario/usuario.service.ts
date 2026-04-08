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
        if (dto.newPassword) user.contraseña = await bcrypt.hash(dto.newPassword, 10);

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
        return result;
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

    //Metodo para listar todos los usuarios (Solo Admin)
    //GET /usuario/list
    async listUsers() {
        const users = await this.usuarioRepo.find({ relations: ['rol'] });
        // Excluye la contraseña de cada usuario.
        // Se usa desestructuracion explicita dentro del callback para que
        // TypeScript infiera correctamente el tipo (evita el error ts(2339))
        return users.map((user) => {
            const { contraseña, ...result } = user;
            return result;
        });
    }

    //Metodo para registrar un nuevo empleado (Solo Admin)
    //POST /usuario/register-employee
    async registerEmployee(dto: RegisterEmployeeDto, creatorRole: string) {
        //Verificar si el rol es de administrador
        if (creatorRole !== 'ADMINISTRADOR') {
            throw new BadRequestException('No tienes permisos para registrar usuarios');
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
            if (cliente && sucursal.id_cliente !== cliente.id_cliente) throw new BadRequestException('La sucursal indicada no pertenece a la empresa seleccionada');
        }

        //Encriptar contraseña
        const hashedPassword = await bcrypt.hash(dto.contraseña, 10);

        // Construir el objeto con tipado explicito Partial<Usuario> para evitar
        // el error de inferencia ts(2769) que ocurre al pasar el literal directamente a create()
        const userData: Partial<Usuario> = {
            nombre: dto.nombre,
            apellido: dto.apellido,
            correo: dto.correo,
            telefono: dto.telefono,
            contraseña: hashedPassword,
            rol: rol,
            id_cliente: cliente?.id_cliente ?? undefined,   // undefined si no se asigno empresa
            id_sucursal: sucursal?.id_sucursal ?? undefined, // undefined si no se asigno sucursal
            is_active: true,
        };

        //Crear la instancia de la entidad y persistirla en la base de datos
        const newUser = this.usuarioRepo.create(userData);
        const savedUser = await this.usuarioRepo.save(newUser);

        //Retornar el nuevo usuario sin exponer la contraseña
        const { contraseña, ...result } = savedUser;
        return result;
    }

    //Metodo para el administrador pueda asignar roles de manera manual
    //PATCH /usuario/:id/rol
    //Administradores / Jefes de sucursal
    async assignRole(targetUserId: number, newRoleName: string){
        const user = await this.validateUserExists(targetUserId);
        const rol = await this.validateRoleExists(newRoleName);
        
        user.rol = rol;
        await this.usuarioRepo.save(user);
        return { message: `Rol de usuario ${user.nombre} actualizado a ${newRoleName}` };
    }

    //Metodo para desactivar la cuenta de un usuario (Solo Admin)
    //PATCH /usuario/:id/deactivate
    async deactivateUser(userId: number) {
        const user = await this.validateUserExists(userId);
        user.is_active = false;
        await this.usuarioRepo.save(user);
        return { message: `Cuenta del usuario ${user.nombre} desactivada` };
    }

    //Metodo para reactivar la cuenta de un usuario (Solo Admin)
    //PATCH /usuario/:id/activate
    async activateUser(userId: number) {
        const user = await this.validateUserExists(userId);
        user.is_active = true;
        await this.usuarioRepo.save(user);
        return { message: `Cuenta del usuario ${user.nombre} reactivada` };
    }

    //Metodo para reasignar un usuario a otra empresa o sucursal (Solo Admin)
    //PATCH /usuario/:id/reassign
    async reassignUser(userId: number, dto: ReassignUserDto) {
        const user = await this.usuarioRepo.findOne({ 
            where: { id_usuario: userId },
            relations: ['rol'] 
        });
        if (!user) throw new NotFoundException('Usuario no encontrado');
    
        if(user.rol.nombre === 'ADMINISTRADOR') throw new BadRequestException('No se puede reasignar a un usuario con rol ADMINISTRADOR');

        if(dto.id_cliente){
            const cliente = await this.clientesRepo.findOne({ where: { id_cliente: dto.id_cliente } });
            if(!cliente) throw new NotFoundException(`Cliente/Empresa con ID ${dto.id_cliente} no existe`);
            user.id_cliente = cliente.id_cliente;

            if(!dto.id_sucursal) user.id_sucursal = undefined; // Si no se proporciona sucursal, se desasigna cualquier sucursal previa
        }

        if(dto.id_sucursal){
            const sucursal = await this.sucursalRepo.findOne({ where: { id_sucursal: dto.id_sucursal } });
            if(!sucursal) throw new NotFoundException(`Sucursal con ID ${dto.id_sucursal} no existe`);
            
            const targetClienteId = dto.id_cliente || user.id_cliente; // Priorizar el cliente del DTO
            if(sucursal.id_cliente !== targetClienteId) throw new BadRequestException('La sucursal indicada no pertenece a la empresa seleccionada');
            user.id_sucursal = sucursal.id_sucursal;
        }

        await this.usuarioRepo.save(user);
        const { contraseña, ...result } = user;
        return { message: `Usuario ${user.nombre} reasignado exitosamente`,
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
}