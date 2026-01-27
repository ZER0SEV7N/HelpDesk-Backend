//Modulo de entidad para la tabla Software equipos
//importaciones necesarias:
import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';


//Definicion de los Planes
@Entity('Planes')
export class Planes {
    //Columna para el ID del Software equipos
    @PrimaryGeneratedColumn()
    id_plan: number; //Llave primaria auto-generada

    //Columna para el nombre del plan
    @Column()
    numero_plan: number; //Numero del plan

    //Columna para el id de los equipos 
    @Column()
    nombre: string; //Licencia del Software equipos

    //Columna para la descripcion
    @Column()
    descripcion: Text; //Licencia del Software equipos

}