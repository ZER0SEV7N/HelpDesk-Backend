//src/equipos/dto/filter-equipo.dto.ts
//DTO para el filtrado dinamico de equipos (query params)
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

export class FilterEquipoDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  //Tipo de equipo
  @IsOptional()
  @IsString()
  tipo?: string;

  //Marca del equipo
  @IsOptional()
  @IsString()
  marca?: string;

  //Numero de serie del equipo
  @IsOptional()
  @IsString()
  numero_serie?: string;

  //Area a la que pertenece el equipo
  @IsOptional()
  @IsString()
  area?: string;

  //Cliente propietario del equipo
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_cliente?: number;

  //Sucursal donde se encuentra el equipo
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_sucursal?: number;

  //Trabajador al que esta asignado el equipo
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_trabajador?: number;

  //Estado activo/inactivo del equipo
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  is_active?: boolean;
}
