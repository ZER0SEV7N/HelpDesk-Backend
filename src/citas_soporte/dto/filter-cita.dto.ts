//src/citas_soporte/dto/filter-cita.dto.ts
//DTO para el filtrado dinamico de citas de soporte (query params)
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { EstadoCita } from '@/entities/Citas-Soporte.entity';

export class FilterCitaDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_cliente?: number;

  //Sucursal donde se realiza la cita
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_sucursal?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  mes?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  anio?: number;

  //Estado de la cita
  @IsOptional()
  @IsEnum(EstadoCita, {
    message: `estado debe ser uno de los siguientes valores: ${Object.values(EstadoCita).join(', ')}`,
  })
  estado?: EstadoCita;

  //Soporte insitu asignado a la cita
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_soporte?: number;
}
