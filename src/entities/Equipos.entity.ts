// src/entities/Equipos.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Usuario } from './Usuario.entity';
import { Tickets } from './Tickets.entity';
import { Clientes } from './Clientes.entity';
import { Sucursales } from './Sucursales.entity';

// Importa las entidades Hardware y Software desde la misma carpeta entities
import { Software_equipos } from './SoftwareEquipos.entity';

import { RegistroHardware } from './RegistroHardware.entity';

@Entity('equipos')
export class Equipos {
  @PrimaryGeneratedColumn({ name: 'id_equipo' })
  id_equipo: number;

  @Column({ length: 50 })
  tipo: string;

  @Column({ length: 50 })
  marca: string;

  @Column({ name: 'num_serie', length: 100 })
  numero_serie: string;

  @Column({ name: 'area', length: 100, nullable: true })
  area: string;

  @Column({ name: 'ult_revision', type: 'date', nullable: true })
  ultRevision: Date;

  @Column({ name: 'rev_programada', type: 'date', nullable: true })
  revProgramada: Date;

  @Column({ default: true })
  is_active: boolean;

  @Column()
  id_cliente: number;

  @Column({ name: 'id_trabajador', nullable: true })
  id_trabajador?: number;

  // Relacion con la tabla Usuario (muchos a uno) para el trabajador asignado al equipo
  @ManyToOne(() => Usuario, (usuario) => usuario.equipos, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'id_trabajador' })
  trabajador?: Usuario;

  // Relacion con la tabla Cliente (muchos a uno) para el cliente al que pertenece el equipo
  @ManyToOne(() => Clientes, (cliente) => cliente.equipos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_cliente' })
  cliente: Clientes;

  // Relacion con la tabla Sucursal (muchos a uno) para la sucursal a la que pertenece el equipo
  @Column({ nullable: true })
  id_sucursal?: number;

  @ManyToOne(() => Sucursales, (sucursal) => sucursal.equipos, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'id_sucursal' })
  sucursal?: Sucursales;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @OneToMany(() => Tickets, (ticket) => ticket.equipo)
  ticket: Tickets[];

  // --- Relaciones ManyToMany con Hardware y Software ---
  @OneToMany(() => RegistroHardware, (rh) => rh.equipo)
  historial_hardware: RegistroHardware[];

  @OneToMany(() => Software_equipos, (se) => se.equipo)
  software_instalado: Software_equipos[];
}
