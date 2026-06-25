//helpdesk-app/src/auth/dto/login.auth.dto.ts
//DTO para el login de usuario
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

//Definicion del DTO para el login
export class LoginDTO {
  @IsEmail()
  @IsNotEmpty()
  @IsString()
  correo: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;
}
