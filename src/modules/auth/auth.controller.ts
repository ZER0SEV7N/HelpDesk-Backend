// src/modules/auth/auth.controller.ts
import {
  Body,
  Controller,
  Post,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDTO } from './dto/login-auth.dto';
import { RegisterDTO } from './dto/register-auth.dto';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  //Post: /auth/register
  //Registra un nuevo usuario administrador, NO UTILIZAR PARA REGISTRO DE USUARIOS ORDINARIOS, SOLO PARA ADMINISTRADORES. QUITAR EN PRODUCCION.
  //Para registro de usuarios ordinarios, usar el endpoint /usuario/register
  /*{
    nombre: "Nombre",
    apellido: "Apellido",
    correo: "correo@example.com",
    telefono: "123456789",
    password: "contraseña",
  } */
  @Post('register')
  register(@Body() dto: RegisterDTO) {
    return this.authService.register(dto);
  }

  //Post: /auth/login
  //Login de usuario, retorna un token JWT y la información del usuario
  /*{
    correo: "correo@example.com",
    password: "contraseña"
  } */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDTO,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, token, role } = await this.authService.login(dto);

    // Configuración robusta de la Cookie segura HttpOnly
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24, // 1 día
    });

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

  //Post: /auth/logout
  //Logout de usuario, elimina la sesión del usuario y la cookie JWT
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('jwt');
    return { message: 'Logout exitoso. Esperamos que vuelva pronto.' };
  }

  //Post: /auth/verify-token
  //Verifica la validez de un token JWT de recuperación de contraseña
  //El token debe ser enviado en el body de la petición como { "token": "..." }
  @Post('verify-token')
  @HttpCode(HttpStatus.OK)
  async verifyToken(@Body('token') token: string) {
    const payload = await this.authService.verifyToken(token);
    return { payload };
  }

  //Post: /auth/recover-password
  //Solicita la recuperación de contraseña, enviando un correo con un token de recuperación
  //El correo debe ser enviado en el body de la petición como { "correo": "..." }
  @Post('recover-password')
  @HttpCode(HttpStatus.OK)
  async recoverPassword(@Body('correo') correo: string) {
    return await this.authService.recoverPassword(correo);
  }

  //Post: /auth/reset-password
  //Resetea la contraseña del usuario usando un token de recuperación válido
  //El body debe contener { "token": "...", "nuevaContraseña": "..." }
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() body: { token: string; nuevaContraseña: string },
  ) {
    return await this.authService.resetPassword(
      body.token,
      body.nuevaContraseña,
    );
  }
}
