// DTO para crear un nuevo registro de Software

import { IsDateString, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateSoftwareDto {
    // Nombre del software, requerido
    @IsString()
    @IsNotEmpty()
    nombre_software: string;

    // Licencia del software, requerida
    @IsString()
    @IsNotEmpty()
    licencia: string;

    // Correo asociado al software
    @IsEmail()
    @IsNotEmpty()
    correo: string;

    //Contraseña del software (cuenta/licencia)
    @IsString()
    @IsNotEmpty()
    contrasenia: string;

    // Fecha de instalación del software (formato ISO: YYYY-MM-DD)
    // Se recomienda usar string para que @IsDateString valide correctamente
    @IsDateString()
    @IsNotEmpty()
    fecha_instalacion: string;

    // Fecha de caducidad de la licencia (formato ISO: YYYY-MM-DD)
    // Se recomienda usar string para que @IsDateString valide correctamente
    @IsDateString()
    @IsNotEmpty()
    fecha_caducidad: string;

    // Proveedor del software
    @IsString()
    @IsNotEmpty()
    proveedor: string;
}