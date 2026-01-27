//Modulo de entidad para la tabla empresa
//importaciones necesarias:
import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Sucursales } from './Sucursales.entity';
import { Equipos } from './Equipos.entity';
//Definicion de la entidad Empresa
@Entity('empresa')
export class Empresa {
    //Columna para el ID de la empresa
    @PrimaryGeneratedColumn()
    id_empresa: number; //Llave primaria auto-generada

    //Columna para el nombre de la empresa
    @Column()
    nombre_cliente: string; //Nombre de la empresa

    //Columna para el RUC de la empresa (Maximo 11 caracteres)
    @Column( { length: 11 } )
    ruc: string; //RUC de la empresa

    //Columna para la direccion
    @Column()
    direccion: string; //Direccion de la empresa

    //Columna para el telefono
    @Column()
    telefono: string; //Telefono de la Empresa

    //Columna para el correo
    @Column()
    correo: string; //Correo de la empresa

    //Relacion con la tabla Sucursales (Un empresa puede tener muchas sucursales)
    //ManyToOne
    @OneToMany(() => Sucursales, (sucursal) => sucursal.empresa)
    sucursal: Sucursales[];

    @OneToMany(() => Equipos, (equipo) => equipo.empresa)
    equipo: Equipos[];
}