// src/citas_soporte/dto/filter-cita.dto.ts
import { Type, Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { EstadoCita } from '@/entities/Citas-Soporte.entity';

export class FilterCitaDto extends PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_cliente?: number;

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

  // Transformacion insensible a mayúsculas/minúsculas para el ENUM
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value !== 'string') return value;

    const normalized = value.trim().toLowerCase().replace(/_/g, ' ');

    const mapEstado: Record<string, EstadoCita> = {
      'pendiente': EstadoCita.PENDIENTE,     // 'Pendiente'
      'en camino': EstadoCita.EN_CAMINO,     // 'En Camino'
      'completada': EstadoCita.COMPLETADA,   // 'Completada'
      'cancelada': EstadoCita.CANCELADA,     // 'Cancelada'
      'reprogramada': EstadoCita.REPROGRAMADA// 'Reprogramada'
    };

    return mapEstado[normalized] || value;
  })
  @IsEnum(EstadoCita, {
    message: `estado debe ser uno de los siguientes valores: ${Object.values(EstadoCita).join(', ')}`,
  })
  estado?: EstadoCita;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_soporte?: number;
}