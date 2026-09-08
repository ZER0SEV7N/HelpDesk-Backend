// src/equipos/dto/filter-equipo.dto.ts
// DTO para el filtrado dinámico de equipos (query params)
import { Type, Transform } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

export class FilterEquipoDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  // Tipo de equipo
  @IsOptional()
  @IsString()
  tipo?: string;

  // Marca del equipo
  @IsOptional()
  @IsString()
  marca?: string;

  // Número de serie del equipo
  @IsOptional()
  @IsString()
  numero_serie?: string;

  // Área a la que pertenece el equipo (ID relacional)
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_area?: number;

  // Cliente propietario del equipo
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_cliente?: number;

  // Sucursal donde se encuentra el equipo
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_sucursal?: number;

  // Trabajador al que está asignado el equipo
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_trabajador?: number;

  // Estado activo/inactivo del equipo
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  is_active?: boolean;
}