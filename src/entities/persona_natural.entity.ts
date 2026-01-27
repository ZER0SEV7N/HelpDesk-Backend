//Modulo de entidad para la tabla Software equipos
//importaciones necesarias:
import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

//importar relacion con software
import { Software } from './software.entity';

//Definicion de la entidad Software
@Entity('Software_equipos')
export class Software_equipos {
    //Columna para el ID del Software equipos
    @PrimaryGeneratedColumn()
    id_software_equipos: number; //Llave primaria auto-generada

    //Columna para el id del Software
    @Column()
    id_software: number; //Id del Software

    //Columna para el id de los equipos 
    @Column()
    id_equipos: number; //Licencia del Software equipos

    //Relacion con la tabla Sucursales (Un empresa puede tener muchas sucursales)
    @OneToMany( () => Software, software => software.id_software )
    @JoinColumn( { name: 'id_software' } )
    software: Software;
}