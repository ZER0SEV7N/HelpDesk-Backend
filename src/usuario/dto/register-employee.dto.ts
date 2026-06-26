//helpdesk-app/src/auth/dto/register.auth.dto.ts
//DTO para la creacion del registro de usuarios
//Importaciones necesarias:
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MinLength,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class RegisterEmployeeDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  apellido: string;

  @IsEmail()
  @IsNotEmpty()
  correo: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  telefono: string;

  // El jefe decide qué rol darle (Ej: 'CLIENTE_TRABAJADOR')
  @IsString()
  @IsNotEmpty()
  rolNombre: string;

  // --- NUEVOS CAMPOS PARA LA ARQUITECTURA MULTI-EMPRESA ---
  @IsOptional()
  @IsNumber()
  id_cliente?: number; // Para saber a qué empresa pertenece

  @IsOptional()
  @IsNumber()
  id_sucursal?: number; // Para saber en qué edificio trabaja físicamente
}
