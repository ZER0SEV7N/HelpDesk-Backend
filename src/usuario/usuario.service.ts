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
import { UpdateProfileDTO } from './dto/update-profile.dto';
import { Rol } from '../entities/Rol.entity';
import { RegisterEmployeeDto } from './dto/register-employee.dto';

//Servicio para manejar la logica de negocio relacionada con los usuarios
@Injectable()
export class UsuarioService {
    constructor(
        @InjectRepository(Usuario) private usuarioRepo: Repository<Usuario>,
        @InjectRepository(Rol) private rolRepo: Repository<Rol>,
    ) {}

    //Metodo para actualizar el perfil del usuario
    //PATCH /usuario/profile
    //TODOS los usuarios pueden actualizar su perfil, pero deben proporcionar su contraseña actual para validar su identidad
    async updateProfile(userId: number, dto: UpdateProfileDTO) {
        const user = await this.usuarioRepo.findOne({ where: { id_usuario: userId} });
        if (!user) throw new NotFoundException('Usuario no encontrado');

        //Validar contraseña actual
        const isPasswordValid = await bcrypt.compare(dto.currentPassword, user.contrasena);
        if (!isPasswordValid) throw new UnauthorizedException('Contraseña actual incorrecta');

        //Si se proporciona nueva contraseña, encriptarla
        if (dto.newPassword) user.contrasena = await bcrypt.hash(dto.newPassword, 10);

        //Actualizar campos opcionales
        if (dto.nombre) user.nombre = dto.nombre;
        if (dto.apellido) user.apellido = dto.apellido;
        if (dto.correo) {
            //Verificar si el nuevo correo ya esta registrado por otro usuario
            const emailExists = await this.usuarioRepo.findOne({ where: { correo: dto.correo } });
            if (emailExists && emailExists.id_usuario !== userId) {
                throw new ConflictException('El correo ya está registrado por otro usuario');
            }
            user.correo = dto.correo;
        }
        //Guardar los cambios
        await this.usuarioRepo.save(user);

        //Retornamos el usuario sin la contraseña por seguridad
        const { contrasena, ...result } = user;
        return result;
    }

    //Metodo para obtener el perfil del usuario
    //GET /usuario/profile
    async getProfile(userId: number) {
        const user = await this.usuarioRepo.findOne({ where: { id_usuario: userId }, relations: ['rol'] });
        if (!user) throw new NotFoundException('Usuario no encontrado');
        //Retornamos el usuario sin la contraseña por seguridad
        const { contrasena, ...result } = user;
        return result;
    }

    //Metodo para listar todos los usuarios (Solo Admin)
    //GET /usuario
    async listUsers() {
        const users = await this.usuarioRepo.find({ relations: ['rol'] });
        return users.map(({ contrasena, ...user }) => user); // Excluye la contraseña de cada usuario
    }

    //Metodo para registrar un nuevo empleado (Solo Admin)
    //POST /usuario/register-employee
    async registerEmployee(dto: RegisterEmployeeDto, creatorRole: string) {
        //Verificar si el correo ya esta registrado
        if (creatorRole !== 'ADMINISTRADOR' && (dto.rolNombre === 'ADMINISTRADOR' || dto.rolNombre === 'SOPORTE_REMOTO')) {
            throw new BadRequestException('No tienes jerarquía para crear este tipo de rol');
        }
        //Validaciones adicionales
        const exists = await this.usuarioRepo.findOne({ where: { correo: dto.correo } });
        if (exists) throw new ConflictException('El correo ya está registrado');
        
        const rol = await this.rolRepo.findOne({ where: { nombre: dto.rolNombre } });
        if (!rol) throw new NotFoundException(`El rol ${dto.rolNombre} no existe`);

        //Encriptar contraseña  
        const hashedPassword = await bcrypt.hash(dto.contrasena, 10);
        //Crear nuevo usuario
        const newUser = this.usuarioRepo.create({
            nombre: dto.nombre,
            apellido: dto.apellido,
            correo: dto.correo,
            telefono: dto.telefono,
            contrasena: hashedPassword,
            rol: rol,
            is_active: true,
        });

        return await this.usuarioRepo.save(newUser);
    }
}
