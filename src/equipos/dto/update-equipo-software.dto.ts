// src/equipos/dto/update-equipo-software.dto.ts
// DTO para editar un componente de SOFTWARE ya instalado en un equipo
// Todos los campos son opcionales.
import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateEquipoSoftwareDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  licencia_asignada?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  observaciones?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'fecha_instalacion debe ser una fecha valida (ISO)' },
  )
  fecha_instalacion?: string;
}
