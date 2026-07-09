// src/equipos/dto/assign-equipio.dto.ts
import {
  IsNumber,
  IsString,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';

export class AssignEquipoDTO {
    @IsString()
    @IsNotEmpty()
    nombre_usuario: string; // Ej: "Juan Perez"

    @IsString()
    @IsNotEmpty()
    area: string; // Ej: "Contabilidad"

    @IsNumber()
    @IsNotEmpty()
    id_sucursal: number; // Ej: 1

}