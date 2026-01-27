//src/entities/tickets.entity.ts
//Modulo de entidad para la tabla ticket
//importaciones necesarias:
import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { Equipos } from './Equipos.entity';

//Definir los estados posibles de un ticket
export enum TicketStatus {
    PENDIENTE = 'Pendiente',
    En_PROGRESO = 'En Progreso',
    RESUELTO = 'Resuelto',
    CERRADO = 'Cerrado',
}

//Definicion de la entidad Tickets
@Entity('tickets')
export class Ticket {
    //Columna para el ID de Tickets
    @PrimaryGeneratedColumn({name: 'id_tickets'})
    id_ticket: number; //Llave primaria auto-generada

    //Columna para el ID de equipos
    @Column({name: 'id_equipos'})
    id_equipos: number; 

    //Columna para el tipo de incidente
    @Column({ name: 'tipo_incidente', length: 100 })
    tipoIncidente: string; //Tipo de incidente (Maximo 100 caracteres)

    //Columna para el nombre del cliente
    @Column({name: 'nombre_cliente', length: 100})
    nombre_cliente: string; //Nombre del cliente

    //Columna para el nombre de la empresa
    @Column({ length: 150 })
    empresa: string; //Nombre de la empresa

    //Columna para el nombre del area
    @Column({ length: 100 })
    area: string; //Nombre del area

    //Columna para para el nombre del sucursal
    @Column({ length: 100 })
    sucursal: string; //Nombre de la sucursal

    //Columna para el estado del ticket
    @Column({
        type: 'enum',
        enum: TicketStatus,
        default: TicketStatus.PENDIENTE,
    })
    estado: TicketStatus; //Estado del ticket

    //Columnna para la fecha de registro 
    @CreateDateColumn({name: 'fecha_registro'})
    fecha_registro: Date; //Fecha de registro del ticket

    //Relacion con la tabla Equipos (Muchos tickets pueden pertenecer a un equipo)
    @ManyToOne(() => Equipos, equipo => equipo.id_equipo)
    @JoinColumn({ name: 'id_equipos' })
    equipo: Equipos; 
}