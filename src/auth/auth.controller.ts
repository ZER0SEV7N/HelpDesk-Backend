//helpdesk-app/src/auth/auth.controller.ts
//Controlador de autenticacion
// ----------------------------------------------------------
import { 
    Body, 
    Controller,
    Post , Res} from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response } from 'express';
import {LoginDTO } from './dto/login-auth.dto';
import { RegisterDTO } from './dto/register-auth.dto';

//Controlador para manejar las rutas de autenticacion (registro y login)
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    //REGISTER
    //POST: /auth/register
    /*Parametros esperados:
    - nombre: string
    - Apellido: string
    - correo: string
    - telefono: string 
    - contrasena: string */
    @Post('register')
    register(@Body() dto: RegisterDTO) {
        return this.authService.register(dto);
    }

    //LOGIN
    //POST: /auth/login
    /*Parametros esperados:
    - correo: string
    - contrasena: string */
    @Post('login')
    async login(@Body() dto: LoginDTO,
        //Permite acceder al objeto de respuesta para setear cookies
        @Res({ passthrough: true }) res: Response
    ) {
        //Obtener el token JWT del servicio de auth
        const {user, token, role } = await this.authService.login(dto);

        //Configurar la cookie
        res.cookie('jwt', token,{
            httpOnly: true, //La cookie no es accesible desde JavaScript del lado del cliente
            secure: process.env.NODE_ENV === 'production', //Solo se envia en conexiones seguras (HTTPS) en producción
            sameSite: 'lax', //Previene el envio de la cookie en solicitudes cross-site no seguras
            maxAge: 1000 * 60 * 60 * 24, //La cookie expira en 1 dia
        });

        //Retonar el usuario autenticado y su rol (opcional, puede ser util para el frontend)
        return {
            message: 'Login exitoso',
            token: token,
            user: {
                nombre: user.nombre,
                apellido: user.apellido,
                correo: user.correo,
                role: role,
            },
        };
    }

    //LOGOUT
    //POST: /auth/logout
    @Post('logout')
    logout(@Res({ passthrough: true}) res: Response) {
        //Eliminar la cookie JWT del cliente
        res.clearCookie('jwt');
        return { message: 'Logout exitoso, Esperamos que vuelva pronto' };
    }
}
