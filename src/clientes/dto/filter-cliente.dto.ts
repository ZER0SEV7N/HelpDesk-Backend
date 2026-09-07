//src/clientes/dto/filter-cliente.dto.ts
//DTO para el filtrado dinamico de clientes (query params)
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { TipoCliente } from '@/entities/Clientes.entity';

export class FilterClienteDto extends PaginationQueryDto {
  //Tipo de cliente (JURIDICA o NATURAL)
  @IsOptional()
  @IsEnum(TipoCliente, {
    message: `tipo_cliente debe ser uno de los siguientes valores: ${Object.values(TipoCliente).join(', ')}`,
  })
  tipo_cliente?: TipoCliente;

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