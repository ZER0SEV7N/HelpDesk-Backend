//src/common/dto/pagination-query.dto.ts
//DTO base reutilizable para paginacion y rango de fechas en filtros dinamicos
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, Min } from 'class-validator';

export class PaginationQueryDto {
  //Numero de pagina solicitada (empieza en 1)
  @IsOptional()
  @Type(() => Number) //Convierte el query param (string) a number antes de validar
  @IsInt()
  @Min(1)
  page?: number = 1;

  //Cantidad de registros por pagina
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  //Fecha de inicio del rango de busqueda
  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  //Fecha de fin del rango de busqueda
  @IsOptional()
  @IsDateString()
  fechaFin?: string;
}