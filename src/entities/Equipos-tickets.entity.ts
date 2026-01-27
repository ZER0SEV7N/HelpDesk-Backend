// src/operaciones/entities/equipos-tickets.entity.ts
import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Equipos } from 'src/entities/Equipos.entity';
import { Ticket } from 'src/entities/Tickets.entity';

@Entity('equipos_tickets')
export class EquiposTickets {
  @PrimaryGeneratedColumn({ name: 'id_equiposTickets' })
  idEquiposTickets: number;

  @ManyToOne(() => Equipos)
  @JoinColumn({ name: 'id_equipos' })
  equipo: Equipos;

  @ManyToOne(() => Ticket)
  @JoinColumn({ name: 'id_tickets' })
  ticket: Ticket;
}