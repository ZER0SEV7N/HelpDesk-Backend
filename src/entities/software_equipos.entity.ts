//Modulo de entidad para la tabla Software equipos
//importaciones necesarias:
import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
//importar relacion con software
import { Software } from './software.entity';
import { Equipos } from './equipos.entity';

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
}