//src/ticket/dto/filter-ticket.dto.ts
//DTO para el filtrado dinamico de tickets (query params)
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { TicketStatus } from '@/entities/Tickets.entity';

export class FilterTicketDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(TicketStatus, {
    message: `estado debe ser uno de los siguientes valores: ${Object.values(TicketStatus).join(', ')}`,
  })
  estado?: TicketStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_equipo?: number;

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
  id_area?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_trabajador?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_soporte?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_software?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  es_software?: boolean;

  @IsOptional()
  @IsString()
  vista?: string;
}
