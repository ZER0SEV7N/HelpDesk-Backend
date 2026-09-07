//src/clientes/dto/filter-cliente.dto.ts
//DTO para el filtrado dinamico de clientes (query params)
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

export class FilterClienteDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  tipo_cliente?: string;

  //Numero de documento del cliente
  @IsOptional()
  @IsString()
  numero_documento?: string;

  //Nombre principal del cliente
  @IsOptional()
  @IsString()
  nombre_principal?: string;

  //Rubro del cliente
  @IsOptional()
  @IsString()
  rubro?: string;

  //Plan contratado por el cliente
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_plan?: number;

  //Estado activo/inactivo del cliente
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  is_active?: boolean;
}
