// src/entities/Equipos.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Planes } from './Planes.entity';
import { Tickets } from './Tickets.entity';
import { Clientes } from './Clientes.entity';
import { Sucursales } from './Sucursales.entity';

// Importa las entidades Hardware y Software desde la misma carpeta entities
import { Hardware } from './Hardware.entity';
import { Software } from './Software.entity';

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

  @Column({ name: 'nombre_usuario', length: 100, nullable: true })
  nombre_usuario: string;

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

  @ManyToOne(() => Clientes, (cliente) => cliente.equipos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_cliente' })
  cliente: Clientes;

  @Column({ nullable: true })
  id_sucursal?: number;

  @ManyToOne(() => Sucursales, (sucursal) => sucursal.equipos, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_sucursal' })
  sucursal?: Sucursales;

  @Column({ nullable: true })
  id_plan?: number;

  @ManyToOne(() => Planes, { nullable: true })
  @JoinColumn({ name: 'id_plan' })
  plan?: Planes;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @OneToMany(() => Tickets, ticket => ticket.equipo)
  ticket: Tickets[];

  // --- Relaciones ManyToMany con Hardware y Software ---
  @ManyToMany(() => Hardware)
  @JoinTable({
    name: 'equipos_hardware', // tabla intermedia
    joinColumn: { name: 'equipo_id', referencedColumnName: 'id_equipo' },
    inverseJoinColumn: { name: 'hardware_id', referencedColumnName: 'id_hardware' }, 
  })
  hardware: Hardware[];

  @ManyToMany(() => Software)
  @JoinTable({
    name: 'equipos_software', // tabla intermedia
    joinColumn: { name: 'equipo_id', referencedColumnName: 'id_equipo' },
    inverseJoinColumn: { name: 'software_id', referencedColumnName: 'id_software' }, 
  })
  software: Software[];
}