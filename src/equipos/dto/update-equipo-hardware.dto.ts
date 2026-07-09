// src/equipos/dto/update-equipo-hardware.dto.ts
// DTO para editar un componente de HARDWARE ya instalado en un equipo
// Todos los campos son opcionales.
import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateEquipoHardwareDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  serie?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  proveedor?: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'fecha_instalacion debe ser una fecha valida (ISO)' },
  )
  fecha_instalacion?: string;
}
