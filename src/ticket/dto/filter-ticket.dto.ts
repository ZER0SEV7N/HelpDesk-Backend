//src/ticket/dto/filter-ticket.dto.ts
//DTO para el filtrado dinamico de tickets (query params)
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { TicketStatus } from '@/entities/Tickets.entity';

export class FilterTicketDto extends PaginationQueryDto {
  //Estado del ticket
  @IsOptional()
  @IsEnum(TicketStatus, {
    message: `estado debe ser uno de los siguientes valores: ${Object.values(TicketStatus).join(', ')}`,
  })
  estado?: TicketStatus;

  //Equipo afectado
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_equipo?: number;

  //Cliente que reporta el ticket
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_cliente?: number;

  //Trabajador que crea el ticket
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_trabajador?: number;

  //Soporte asignado al ticket
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_soporte?: number;

  //Software relacionado al ticket
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_software?: number;

  //Indica si el ticket es una incidencia de software
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  es_software?: boolean;
}