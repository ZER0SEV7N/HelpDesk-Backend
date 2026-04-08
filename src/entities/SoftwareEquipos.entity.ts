//Modulo de entidad para la tabla Software equipos
//importaciones necesarias:
import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
//importar relacion con software
import { Software } from './Software.entity';
import { Equipos } from './Equipos.entity';

//Definicion de la entidad Software
@Entity('software_equipos')
export class Software_equipos {
    //Columna para el ID del Software equipos
    @PrimaryGeneratedColumn()
    id_software_equipos: number; //Llave primaria auto-generada

    //Columna para el id del software
    @ManyToOne(() => Software, (soft) => soft.se)
    @JoinColumn({ name: 'id_software' })
    soft: Software;

   @ManyToOne(() => Equipos, (equipo) => equipo.software_instalado)
    @JoinColumn({ name: 'id_equipo' })
    equipo: Equipos;
    
    @Column({ name: 'fecha_instalacion', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    fecha_instalacion: Date;

    @Column({ length: 100, nullable: true })
    licencia_asignada: string; // Si este equipo usa un serial específico (ej. un Windows OEM)

    @Column({ default: true })
    is_active: boolean; // ¿Sigue instalado? (Si se formatea, se pasa a false)

    @Column({ nullable: true })
    observaciones: string; // Ej: "Se instaló por el ticket #150"

    //Fecha de creacion
    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;

    //Fecha de actualizacion
    @UpdateDateColumn({ name: 'updated_at' })
    updated_at: Date;
}
