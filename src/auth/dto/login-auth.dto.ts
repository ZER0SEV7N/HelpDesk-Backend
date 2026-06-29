//helpdesk-app/src/auth/dto/login.auth.dto.ts
//DTO para el login de usuario
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

//Definicion del DTO para el login
export class LoginDTO {
  //Correo del usuario
  @IsEmail() //Valida que sea un correo valido
  @IsNotEmpty() //Valida que no este vacio
  @IsString() //Valida que sea una cadena de texto
  correo: string;

  //Contraseña del usuario
  @IsString() //Valida que sea una cadena de texto
  @IsNotEmpty() //Valida que no este vacio 
  contraseña: string;
}

