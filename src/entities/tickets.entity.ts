//src/entities/Tickets.entity.ts
//Modulo de entidad para la tabla ticket

import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  JoinColumn, 
  ManyToOne, 
  CreateDateColumn, 
  UpdateDateColumn, 
  OneToMany 
} from 'typeorm';

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
export class Tickets {

    //Columna para el ID de Tickets
    @PrimaryGeneratedColumn({ name: 'id_tickets' })
    id_ticket: number;

    //Columna para el PIN de ticket
    @Column({ type: 'varchar', unique: true, length: 6 })
    pin: string;

    //Columna para el Asunto del ticket
    @Column({ type: 'varchar', length: 255 })
    asunto: string;

    //Columna para el detalle del ticket
    @Column({ type: 'text' })
    detalle: string;

    //Columna para el estado del ticket
    @Column({
        type: 'enum',
        enum: TicketStatus,
        default: TicketStatus.PENDIENTE,
    })
    estado: TicketStatus;

    // Relación con Equipos
    @Column()
    id_equipo: number;

    @ManyToOne(() => Equipos, { eager: false })
    @JoinColumn({ name: 'id_equipo' })
    equipo: Equipos;

    // Usuario que crea el ticket
    @Column()
    id_cliente: number;

    @ManyToOne(() => Usuario, { eager: false })
    @JoinColumn({ name: 'id_cliente' })
    cliente: Usuario;

    // Soporte asignado
    @Column({ nullable: true })
    id_soporte?: number;

    @ManyToOne(() => Usuario, { nullable: true })
    @JoinColumn({ name: 'id_soporte' })
    soporte?: Usuario;

    // Incidencia software
    @Column({ nullable: true })
    id_software?: number;

    @Column({ default: false })
    es_software: boolean;

    // Evidencia
    @Column({ nullable: true })
    imagen_url?: string;
    
    // Fecha de creación
    @CreateDateColumn({ name: 'fecha_creacion' })
    fecha_creacion: Date;

    // Fecha de actualización
    @UpdateDateColumn({ name: 'fecha_actualizacion' })
    fecha_actualizacion: Date;
}