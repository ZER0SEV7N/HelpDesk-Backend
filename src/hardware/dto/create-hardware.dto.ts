import {
  IsString, // string
  IsNotEmpty, // no vacío
  IsDateString, // fecha ISO
  IsOptional, // opcional
  IsInt, // entero
  Min, // mínimo
} from 'class-validator';

import { Type } from 'class-transformer'; // transforma tipos

// DTO para crear hardware
export class CreateHardwareDto {
  @IsString()
  @IsNotEmpty()
  tipoEquipo: string; // tipo de equipo

  @IsString()
  @IsNotEmpty()
  numeroSerie: string; // serie

  @IsDateString()
  fechaCompra: string; // fecha compra

  @IsString()
  @IsNotEmpty()
  plan: string; // plan

  @IsString()
  @IsNotEmpty()
  marca: string; // marca

  @IsString()
  @IsNotEmpty()
  proveedor: string; // proveedor

  @IsString()
  @IsNotEmpty()
  descripcion: string; // descripcion

  @IsDateString()
  @IsOptional()
  ultRevision?: string; // ultima revisión

  @IsDateString()
  @IsOptional()
  revProgramada?: string; // proxima revision

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  idRH?: number; // id relacionado
}
