//Entidad RegistroHardware
//Definicion de la entidad RegistroHardware
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Hardware } from './Hardware.entity';
import { Equipos } from './Equipos.entity';
//Definicion de la entidad RegistroHardware
@Entity('registro_hardware')
export class RegistroHardware {
  //Columna para el ID del registro de hardware
  @PrimaryGeneratedColumn()
  id_RH: number; //Llave primaria auto-generada

  //Columna fecha de instalacion
  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  fecha_instalacion: Date;

  //descripcion del hardware
  @Column('text')
  descripcion: string; //Descripcion del hardware instalado

  //Columnna serie del hardware
  @Column({ length: 100 })
  serie: string; //Numero de serie del hardware

  //Columna de proveedor
  @Column()
  proveedor: string; //Proveedor del hardware

  //Relacion con la tabla Hardware (Muchos registros de hardware pertenecen a un hardware)
  @Column()
  id_hardware: number;

  @ManyToOne(() => Hardware, (hw) => hw.registros)
  @JoinColumn({ name: 'id_hardware' })
  hardware: Hardware;

  // --- RELACIÓN CON EL EQUIPO (La computadora donde se instaló) ---
  @Column()
  id_equipo: number;

  @ManyToOne(() => Equipos, (equipo) => equipo.historial_hardware)
  @JoinColumn({ name: 'id_equipo' })
  equipo: Equipos;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}