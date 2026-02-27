//helpdesk-backend/src/entities/mensajes.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Ticket } from "./Tickets.entity";
import { Usuario } from "./Usuario.entity";

@Entity('mensajes')
export class Mensaje {
    //id del mensaje
    @PrimaryGeneratedColumn({ name: 'id_mensaje' })
    id: number;

    //Contenido del mensaje
    @Column({ name: 'contenido', type: 'text' })
    contenido: string;

    //Subida de archivos adjuntos (opcional)
    @Column({ name: 'adjunto', type: 'varchar', nullable: true })
    adjunto: string;

    //Columna de leido
    @Column({ type: 'timestamp', nullable: true })
    leido: Date;

    @CreateDateColumn({ name: 'fecha_creacion' })
    fechaCreacion: Date;

    @UpdateDateColumn({ name: 'fecha_actualizacion' })
    fechaActualizacion: Date;

    //Relación con el ticket
    @ManyToOne(() => Ticket, ticket => ticket.messages)
    ticket: Ticket;

    @ManyToOne(() => Usuario, usuario => usuario.mensajes)
    enviador: Usuario;
}