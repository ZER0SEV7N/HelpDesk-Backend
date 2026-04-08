//src/entities/Tickets.entity.ts
//Modulo de entidad para la tabla ticket

import { 
  Entity, Column, PrimaryGeneratedColumn, 
  JoinColumn, ManyToOne, 
  CreateDateColumn, UpdateDateColumn 
} from 'typeorm';

import { Equipos } from './Equipos.entity';
import { Usuario } from './Usuario.entity';
import { Clientes } from './Clientes.entity';

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

    @ManyToOne(() => Clientes, { eager: false }) 
    @JoinColumn({ name: 'id_cliente' })
    cliente: Clientes;

    @Column()
    id_trabajador: number; 

    @ManyToOne(() => Usuario, { eager: false }) 
    @JoinColumn({ name: 'id_trabajador' })
    trabajador: Usuario;
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

    //Fecha de creacion
    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;

    //Fecha de actualizacion
    @UpdateDateColumn({ name: 'updated_at' })
    updated_at: Date;
}
