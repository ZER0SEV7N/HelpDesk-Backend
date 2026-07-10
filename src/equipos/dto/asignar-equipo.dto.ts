// src/equipos/dto/asignar-equipo.dto.ts
// DTO para asignar un equipo a un trabajador/área (PATCH /equipos/:id/asignar)
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class AsignarEquipoDto {
  // ID del trabajador al que se asigna el equipo
  @IsNumber()
  @IsNotEmpty()
  id_trabajador: number;

  // Área / departamento donde queda el equipo
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  area: string;

  // Sucursal opcional. Se tolera recibirlo como string numérico y se
  // convierte a number antes de validar con @IsNumber().
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  id_sucursal?: number;
}
