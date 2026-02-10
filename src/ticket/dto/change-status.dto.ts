//Definir los estados posibles de un ticket
//DTO para el cambio de estado de un ticket
import { TicketStatus } from '../../entities/Tickets.entity';

export class ChangeStatusDTO {
  estado: TicketStatus;
}
