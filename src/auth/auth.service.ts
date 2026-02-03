import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../entities/Usuario.entity'; // Ajusta la ruta según tu estructura
import { Rol } from '../entities/Rol.entity';
import { RegisterAuthDto } from './dto/register.auth.dto';
import { LoginAuthDto } from './dto/login.auth.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(Usuario)
        private usuarioRepository: Repository<Usuario>,
        @InjectRepository(Rol)
        private rolRepository: Repository<Rol>,
        private jwtService: JwtService,
    ) {}

    // REGISTRO DE USUARIO
    async register(userObject: RegisterAuthDto) {
        const { contrasena, ...userData } = userObject;

        // 1. Buscar si el rol existe (Por defecto asignamos rol ID 1 o buscamos por nombre 'Usuario')
        // Ajusta esto según tu lógica de roles en base de datos.
        const defaultRole = await this.rolRepository.findOne({ where: { id_rol: 1 } }); 
        
        if (!defaultRole) throw new HttpException('Rol por defecto no encontrado', HttpStatus.CONFLICT);

        // 2. Encriptar contraseña
        const hashedPassword = await bcrypt.hash(contrasena, 10);

        // 3. Crear usuario
        const newUser = this.usuarioRepository.create({
            ...userData,
            contrasena: hashedPassword,
            rol: defaultRole,
            is_active: true
        });

        return await this.usuarioRepository.save(newUser);
    }

    // LOGIN DE USUARIO
    async login(userObject: LoginAuthDto) {
        const { correo, contrasena } = userObject;

        // 1. Buscar usuario por correo y traer su relación con Rol
        const findUser = await this.usuarioRepository.findOne({ 
            where: { correo },
            relations: ['rol'] 
        });

        if (!findUser) throw new HttpException('USUARIO_NO_ENCONTRADO', HttpStatus.NOT_FOUND);

        // 2. Verificar contraseña
        const checkPassword = await bcrypt.compare(contrasena, findUser.contrasena);
        if (!checkPassword) throw new HttpException('CONTRASENA_INCORRECTA', HttpStatus.FORBIDDEN);

        // 3. Generar Token (Payload)
        const payload = { sub: findUser.id_usuario, correo: findUser.correo, rol: findUser.rol.nombre };
        
        return {
            user: findUser,
            token: this.jwtService.sign(payload),
        };
    }
}