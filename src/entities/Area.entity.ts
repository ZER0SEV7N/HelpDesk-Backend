//src/entities/area.entity.ts
//Modulo de entidad para la tabla Area
//importaciones necesarias:
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Empresa } from './Empresa.entity';
import { MicroEmpresa } from './MicroEmpresa.entity';
import { Sucursales } from './Sucursal.entity';

//Definicion de la entidad Area
@Entity('Area')
export class Area {
    //Columna para el ID del area
    @PrimaryGeneratedColumn({ name: 'id_area' })
    id_area: number; //Llave primaria auto-generada

    //Columna para el nombre del area
    @Column({ name: 'nombre_area', length: 100 })
    nombre_area: string; //Nombre del area

    //Columna de contacto del area
    @Column({ length: 100 })
    contacto: string; //Contacto del area

    //Columna para el telefono del area
    @Column({ length: 20 })
    telefono: string; //Telefono del area

    //Columna para el correo del area
    @Column({ length: 100 })
    correo: string; //Correo del area

    //Relacion Con la tabla Empresa (Un area puede pertenecer a muchas empresas)
    @ManyToOne(() => Empresa, {nullable: true}) 
    @JoinColumn({ name: 'id_empresa' })
    empresa: Empresa;

    //Relacion Con la tabla MicroEmpresa (Un area puede pertenecer a muchas microempresas)
    @ManyToOne(() => MicroEmpresa, {nullable: true}) 
    @JoinColumn({ name: 'id_microempresa' })
    microEmpresa: MicroEmpresa;

    //Relacion con la tabla Sucursales (Un area puede pertenecer a muchas sucursales)
    @ManyToOne(() => Sucursales, {nullable: true})
    @JoinColumn({ name: 'id_sucursal' })
    sucursal: Sucursales;
}