//helpdesk-app/src/auth/auth.service.ts
//Servicio de autenticacion para el manejo de registro y login de usuarios
//----------------------------------------------------------
import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common'; //Importaciones necesarias
import { InjectRepository } from '@nestjs/typeorm'; //Para inyectar repositorios de TypeORM
import { Repository } from 'typeorm'; //Repositorio de TypeORM
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../entities/Usuario.entity'; 
import { Rol } from '../entities/Rol.entity';
import { RegisterDTO } from './dto/register-auth.dto'; 
import { MailerService } from '@nestjs-modules/mailer';
import { LoginDTO } from './dto/login-auth.dto';
import { env } from 'process';

//Servicio de autenticacion
@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(Usuario)
        private usuariosRepo: Repository<Usuario>,
        @InjectRepository(Rol)
        private rolRepo: Repository<Rol>,
        private jwtService: JwtService,
        private mailerService: MailerService
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
        const defaultRole = await this.rolRepo.findOne({ where: { nombre: 'ADMINISTRADOR' } }); 
        
        if (!defaultRole) throw new HttpException('Rol por defecto no encontrado', HttpStatus.CONFLICT);

        // 2. Encriptar contraseña
        const hashedPassword = await bcrypt.hash(dto.contraseña, 10);

        // 3. Crear usuario
        const newUser = this.usuariosRepo.create({
            nombre: dto.nombre,
            apellido: dto.apellido,
            correo: dto.correo,
            contraseña: hashedPassword,
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
            dto.contraseña,      
            user.contraseña, 
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException('Contraseña incorrecta');
        }

        const payload = {
            sub: user.id_usuario,
            role: user.rol.nombre,
            clienteId: user.id_cliente,
            sucursalId: user.id_sucursal
        };

        const token = this.jwtService.sign(payload);

        return {
            user,
            role: user.rol.nombre,
            token,
        };
    }

    //Metodo para solicitar un restablecimiento de contraseña (envia un correo con un token de restablecimiento)
    async recoverPassword(correo: string) {
        const user = await this.usuariosRepo.findOne({ where: { correo } });

        if(!user) throw new HttpException('Correo no registrado', HttpStatus.NOT_FOUND);

        const resetToken = this.jwtService.sign(
            {sub: user.id_usuario},
            {expiresIn:'30m', secret: env.JWT_RESET_SECRET || 'resetKey'}
        );
        
        const frontendURL = env.FRONTEND_URL || 'http://localhost:3000';
        const resetLink = `${frontendURL}/reset-password?token=${resetToken}`;

        try{
            await this.mailerService.sendMail({
                to: user.correo,
                subject: env.RESET_PASSWORD_EMAIL_SUBJECT || 'Soporte HelpDesk - Restablecimiento de contraseña',
                html: env.RESET_PASSWORD_EMAIL_TEMPLATE || `
                    <h2>Hola, ${user.nombre}</h2>
                    <p>Has solicitado restablecer tu contraseña en el sistema HelpDesk.</p>
                    <p>Haz clic en el siguiente botón para crear una nueva contraseña. Este enlace <b>expirará en 15 minutos</b>.</p>
                    <a href="${resetLink}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Restablecer Contraseña</a>
                    <p>Si no solicitaste este cambio, ignora este correo.</p>
                `,
            });
            return { message: 'Correo de restablecimiento enviado exitosamente' };
        } catch (error){
            throw new HttpException('Error al enviar el correo de restablecimiento', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    //Metodo para reiniciar la contraseña utilizando el token de restablecimiento
    async resetPassword(token: string, nuevaContraseña: string){
        try{
            const payload = await this.jwtService.verifyAsync(token, {
                secret: env.JWT_RESET_SECRET || 'resetKey',
            });

            const hashPassword = await bcrypt.hash(nuevaContraseña, 10);

            await this.usuariosRepo.update({ id_usuario: payload.sub }, { contraseña: hashPassword });

            return { message: 'Contraseña restablecida exitosamente' };
        } catch (error) {
            throw new HttpException('Token inválido o expirado', HttpStatus.BAD_REQUEST);
        }
    }
    

    //Metodo para verificar el token JWT (puede ser utilizado en guards o middleware)
    async verifyToken(token: string) {
        try {
            //Verificar y decodificar el token JWT
            const payload = await this.jwtService.verifyAsync(token);
            return payload;
        } catch (error) {
            throw new UnauthorizedException('Token inválido o expirado');
        }
    }
}