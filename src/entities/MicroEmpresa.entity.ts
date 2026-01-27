//src/entities/MicroEmpresa.entity.ts
//Modulo de entidad para la tabla microempresa
//importaciones necesarias:
import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Equipo } from './Equipos.entity';

//Definicion de la entidad MicroEmpresa
@Entity('MicroEmpresa')
export class MicroEmpresa {

    //Columna para el ID de la microempresa
    @PrimaryGeneratedColumn({name: 'id_microempresa'})
    id_microempresa: number; //Llave primaria auto-generada

    //Columna para el nombre de la microempresa
    @Column({ name: 'nombre_cliente', length: 100 })
    nombre_cliente: string; //Nombre de la microempresa

    //Columna para el RUC de la microempresa (Maximo 11 caracteres)
    @Column({ length: 11 })
    ruc: string; //RUC de la microempresa

    //Columna para la direccion
    @Column({ length: 200 })
    direccion: string; //Direccion de la microempresa

    //Columna para el telefono
    @Column({ length: 20 })
    telefono: string; //Telefono de la microempresa

    //Columna para el correo
    @Column({ length: 100 })
    correo: string; //Correo de la microempresa

    @OneToMany(() => Equipo, (equipo) => equipo.microEmpresa)
    equipos: Equipo[];
}