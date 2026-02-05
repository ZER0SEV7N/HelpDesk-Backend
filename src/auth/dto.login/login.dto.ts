import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  correo: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  contrasena: string;
}

