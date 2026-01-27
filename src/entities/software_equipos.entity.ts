//Modulo de entidad para la tabla Software equipos
//importaciones necesarias:
import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
//importar relacion con software
import { Software } from './software.entity';
import { Equipo } from './equipo.entity';

//Definicion de la entidad Software
@Entity('Software_equipos')
export class Software_equipos {
    //Columna para el ID del Software equipos
    @PrimaryGeneratedColumn()
    id_software_equipos: number; //Llave primaria auto-generada

    //Columna para el id del software
    @ManyToOne(() => Software, (soft) => soft.softwareEquipos)
    @JoinColumn({ name: 'id_software' })
    software: Software;

    @ManyToOne(() => Equipo) // Asegúrate de agregar @OneToMany en Equipo si lo necesitas
    @JoinColumn({ name: 'id_equipos' })
    equipo: Equipo;
}