// src/citas_soporte/dto/add-tickets-to-cita.dto.ts
import { IsArray, ArrayMinSize, IsInt } from 'class-validator';

export class AddTicketsToCitaDto {
  @IsArray({ message: 'Los IDs de los tickets deben ser un arreglo.' })
  @ArrayMinSize(1, { message: 'Debe enviar al menos un ID de ticket.' })
  @IsInt({
    each: true,
    message: 'Cada ID de ticket debe ser un número entero.',
  })
  ticket_ids: number[];
}
