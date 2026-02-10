//helpdesk-app/src/auth/auth.service.ts
//Servicio de autenticacion para el manejo de registro y login de usuarios
//----------------------------------------------------------
import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common'; //Importaciones necesarias
import { InjectRepository } from '@nestjs/typeorm'; //Para inyectar repositorios de TypeORM
import { Repository } from 'typeorm'; //Repositorio de TypeORM
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../entities/Usuario.entity'; // Ajusta la ruta según tu estructura
import { Rol } from '../entities/Rol.entity';
import { RegisterDTO } from './dto/register.auth.dto'; // Ajusta la ruta según tu estructura
import { LoginDTO } from './dto/login.auth.dto';

//Servicio de autenticacion
@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(Usuario)
        private usuariosRepo: Repository<Usuario>,
        @InjectRepository(Rol)
        private rolRepo: Repository<Rol>,
        private jwtService: JwtService,
    ) {}

    //Metodo para registrar un usuario
    async register(dto: RegisterDTO) {
        //Verificar si el usuario ya existe por correo
        const exists = await this.usuariosRepo.findOne({
            where: { correo: dto.correo },
        });

        if (exists) {
            throw new HttpException(
                'El correo ya está registrado',
                HttpStatus.CONFLICT,
            );
        }

        //1. Buscar si el rol existe (Por defecto asignamos rol ID 1 o buscamos por nombre 'Usuario')
        const defaultRole = await this.rolRepo.findOne({ where: { nombre: 'TRABAJADOR' } }); 
        
        if (!defaultRole) throw new HttpException('Rol por defecto no encontrado', HttpStatus.CONFLICT);

        // 2. Encriptar contraseña
        const hashedPassword = await bcrypt.hash(dto.contrasena, 10);

        // 3. Crear usuario
        const newUser = this.usuariosRepo.create({
            nombre: dto.nombre,
            apellido: dto.apellido,
            correo: dto.correo,
            contrasena: hashedPassword,
            telefono: dto.telefono,
            rol: defaultRole,
            is_active: true,
        });

        return await this.usuariosRepo.save(newUser);
    }

    //Metodo para el LOGIN DE USUARIO
    async login(dto: LoginDTO) {
        const user = await this.usuariosRepo.findOne({
            where: { correo: dto.correo },
            relations: ['rol'], // Asegura que el rol se cargue junto con el usuario
        });

        //En caso de que no exista el usuario
        if (!user || !user.is_active) throw new UnauthorizedException('Correo incorrecto');

        //Verificar contraseña
        const isPasswordValid = await bcrypt.compare(
            dto.contrasena,      
            user.contrasena, 
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException('Contraseña incorrecta');
        }

        const payload = {
            sub: user.id_usuario,
            role: user.rol.nombre,
        };

        const token = this.jwtService.sign(payload);


        return {
            user,
            role: user.rol.nombre,
            token,
        };
    }
}