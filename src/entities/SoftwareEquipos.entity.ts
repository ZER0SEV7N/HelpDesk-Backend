//Modulo de entidad para la tabla Software equipos
//importaciones necesarias:
import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
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

    @ManyToOne(() => Equipos) // Asegúrate de agregar @OneToMany en Equipo si lo necesitas
    @JoinColumn({ name: 'id_equipos' })
    equipo: Equipos;

    //Fecha de creacion
    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;

    //Fecha de actualizacion
    @UpdateDateColumn({ name: 'updated_at' })
    updated_at: Date;
}
