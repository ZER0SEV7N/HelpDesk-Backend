//src/entities/Tickets.entity.ts
//Modulo de entidad para la tabla ticket
//importaciones necesarias:
import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { Equipos } from './Equipos.entity';
import { Usuario } from './Usuario.entity';

//Definir los estados posibles de un ticket
export enum TicketStatus {
    PENDIENTE = 'Pendiente',
    ASIGNADO = 'Asignado',
    EN_PROGRESO = 'En Progreso',
    REABIERTO = 'Reabierto',
    CERRADO = 'Cerrado',
}

//Definicion de la entidad Tickets
@Entity('tickets')
export class Ticket {
    //Columna para el ID de Tickets
    @PrimaryGeneratedColumn({name: 'id_tickets'})
    id_ticket: number; //Llave primaria auto-generada

    //Columna para el PIN de ticket (Codigo unico para cada ticket)
    //Generar un PIN unico para cada ticket (puede ser un numero aleatorio o un string alfanumerico)
    @Column({ unique: true, length: 6 })
    pin: string; //PIN unico del ticket

    //Columna para el Asunto del ticket
    @Column({  })
    asunto: string; //Asunto del ticket

    //Columna para el detalle del ticket
    @Column({ type: 'text' })
    detalle: string;

    //Columna para el estado del ticket
    @Column({
        type: 'enum',
        enum: TicketStatus,
        default: TicketStatus.PENDIENTE,
    })
    estado: TicketStatus; //Estado del ticket

   // ---------------------------------------------------------
  // Relación con Equipos
  // ---------------------------------------------------------
  @Column()
  id_equipo: number;

  @ManyToOne(() => Equipos, { eager: false })
  @JoinColumn({ name: 'id_equipo' })
  equipo: Equipos;

  // ---------------------------------------------------------
  // Usuario que crea el ticket (cliente / trabajador)
  // ---------------------------------------------------------
  @Column()
  id_cliente: number;

  @ManyToOne(() => Usuario, { eager: false })
  @JoinColumn({ name: 'id_cliente' })
  cliente: Usuario;

  // ---------------------------------------------------------
  // Soporte asignado (nullable)
  // ---------------------------------------------------------
  @Column({ nullable: true })
  id_soporte?: number;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'id_soporte' })
  soporte?: Usuario;

  // ---------------------------------------------------------
  // Incidencia relacionada a software (opcional)
  // ---------------------------------------------------------
  @Column({ nullable: true })
  id_software?: number;

  // Flag para identificar incidencia de software
  @Column({ default: false })
  es_software?: boolean;

  // ---------------------------------------------------------
  // Evidencia (imagen opcional)
  // ---------------------------------------------------------
  @Column({ nullable: true })
  imagen_url?: string;

  // ---------------------------------------------------------
  // Fecha de creación
  // ---------------------------------------------------------
  @CreateDateColumn({ name: 'fecha_creacion' })
  fecha_creacion: Date;
}