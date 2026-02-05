//helpdesk-app/src/auth/dto/register.auth.dto.ts
//DTO para la creacion del registro de usuarios
//Importaciones necesarias:
import { IsString, IsNotEmpty, Length, IsEmail, MinLength, MaxLength } from 'class-validator';

export class RegisterDTO{
    @IsString() //Valida que sea una cadena de texto
    @IsNotEmpty() //Valida que no este vacio
    @Length(3, 50) //Valida que tenga entre 3 y 50 caracteres
    nombre: string; //Nombre

    @IsString()
    @IsNotEmpty()
    @Length(3, 50)
    apellido: string; //Apellido

    @IsEmail()
    @IsNotEmpty()
    correo: string; //Correo

    @IsString()
    @IsNotEmpty()
    telefono: string; //Telefono

    @IsString()
    @IsNotEmpty()
    @MinLength(6,{message :'La contraseña debe tener al menos 6 caracteres' })
    @MaxLength(40)
    contraseña: string; //Contraseña
}