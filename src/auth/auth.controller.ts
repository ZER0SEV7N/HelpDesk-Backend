//helpdesk-app/src/auth/auth.controller.ts
//Controlador de autenticacion
// ----------------------------------------------------------
import { 
    Body, 
    Controller,
    Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import {LoginDTO } from './dto/login.auth.dto';
import { RegisterDTO } from './dto/register.auth.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    //REGISTER
    //POST /auth/register
    //Permite a un nuevo usuario registrarse en el sistema proporcionando su nombre, correo electrónico y contraseña. El controlador recibe los datos del usuario a través del cuerpo de la solicitud (DTO) y delega la lógica de registro al servicio de autenticación. El servicio se encarga de validar los datos, crear un nuevo usuario en la base de datos y devolver una respuesta adecuada al cliente.
    @Post('register')
    register(@Body() dto: RegisterDTO) {
        return this.authService.register(dto);
    }

    //LOGIN
    @Post('login')
    login(@Body() dto: LoginDTO) {
        return this.authService.login(dto);
    }
}
