// Entidad para la tabla planes (planes y precios)
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('planes')
export class Planes {
  @PrimaryGeneratedColumn({ name: 'id_plan' })
  id_plan: number;

  /** Número/código del plan (ej: 1, 2, 3) */
  @Column({ name: 'numero_plan', type: 'int' })
  numero_plan: number;

  /** Nombre del plan (ej: Básico, Premium, Empresarial) */
  @Column({ length: 100 })
  nombre: string;

  /** Descripción de lo que incluye el plan */
  @Column('text')
  descripcion: string;

  /** Precio del plan (moneda local) */
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  precio: number;
}