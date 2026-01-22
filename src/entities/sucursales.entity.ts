//Entidad Sucursal
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, JoinColumn } from 'typeorm';

//Definicion de la entidad Sucursal
@Entity('Sucursales')
export class Sucursales {
    //Columna para el ID de la sucursal
    @PrimaryGeneratedColumn()
    id_sucursal: number; //Llave primaria auto-generada

    //Columna para el ID de la empresa
    @Column()
    id_empresa: number; //Llave foranea a la tabla Empresa

    //Columna para el nombre de la sucursal
    @Column()
    nombre_sucursal: string; //Nombre de la sucursal

    //Columna de encargado de la sucursal
    @Column()
    encargado: string; //Encargado de la sucursal

    //Columna para el telefono de la sucursal
    @Column({ length: 20 })
    telefono: string; //Telefono de la sucursal

    //Columna para la direccion de la sucursal
    @Column()
    correo: string; //Direccion de la sucursal

    //Relacion con la tabla Empresa (Muchas sucursales pertenecen a una empresa)
    @OneToMany(() => Sucursales, sucursal => sucursal.id_empresa)
    @JoinColumn({ name: 'id_empresa' })
    sucursales: Sucursales[];
}