//helpDesk-Backend/src/usuario/dto/update-profile.dto.ts
//DTO para actualizar el perfil del usuario
import { IsString, IsEmail, IsOptional, IsNotEmpty, MinLength } from 'class-validator';

export class UpdateProfileDTO {
    //Obligatorio: Colocar la contraseña actual para validar la identidad del usuario
    @IsString()
    @IsNotEmpty()
    currentPassword: string;

    //Opcional: Nuevo nombre del usuario
    @IsString()
    @IsOptional()
    nombre?: string;

    //Opcional: Nuevo apellido del usuario
    @IsString()
    @IsOptional()
    apellido?: string;

    //Opcional: Nuevo correo electronico del usuario
    @IsEmail()
    @IsOptional()
    correo?: string;

    //Opcional: Nuevo telefono del usuario
    @IsString()
    @IsOptional()
    telefono?: string;

    //Opcional: Nueva contraseña del usuario (con validacion de longitud minima)
    @IsOptional()
    @IsString()
    @MinLength(6, { message: 'La nueva contraseña debe tener al menos 6 caracteres' })
    nuevaContraseña?: string;
}