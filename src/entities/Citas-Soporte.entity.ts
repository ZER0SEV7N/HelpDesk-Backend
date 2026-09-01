import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Tickets } from './Tickets.entity';
import { Usuario } from './Usuario.entity';
import { Sucursales } from './Sucursales.entity';
import { Area } from './Area.entity';

// Estados posibles de una cita
export enum EstadoCita {
  PENDIENTE = 'Pendiente',
  EN_CAMINO = 'En Camino',
  COMPLETADA = 'Completada',
  CANCELADA = 'Cancelada',
  REPROGRAMADA = 'Reprogramada',
}

@Entity('citas_soporte')
export class Citas_Soporte {
  // Llave primaria auto-generada
  @PrimaryGeneratedColumn({ name: 'id_cita' })
  id_cita: number;

  // Fecha programada de la cita
  @Column({ name: 'fecha_programada', type: 'datetime', nullable: false })
  fecha_programada: Date;

  // Estado de la cita
  @Column({ type: 'enum', enum: EstadoCita, default: EstadoCita.PENDIENTE })
  estado: EstadoCita;

  // Observaciones de la cita (opcional)
  @Column({ type: 'text', nullable: true })
  observaciones: string;

  // Fecha de creación
  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  // Fecha de actualización
  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  // Relación de muchos a muchos con la entidad Tickets
  @ManyToMany(() => Tickets)
  @JoinTable({
    name: 'citas_tickets',
    joinColumn: { name: 'id_cita', referencedColumnName: 'id_cita' },
    inverseJoinColumn: {
      name: 'id_ticket',
      referencedColumnName: 'id_ticket',
    },
  })
  tickets: Tickets[];

  // Relación de muchos a uno con la entidad Usuario (Soporte INSITU)
  @ManyToOne(() => Usuario, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_soporte' })
  soporte_insitu: Usuario;

  // Relación de muchos a uno con la entidad Sucursales
  @ManyToOne(() => Sucursales, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_sucursal' })
  sucursal: Sucursales;
}
