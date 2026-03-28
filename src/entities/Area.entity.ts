//src/entities/area.entity.ts
//Modulo de entidad para la tabla Area
//importaciones necesarias:
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Sucursales } from './Sucursales.entity';

//Definicion de la entidad Area
@Entity('area')
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

    //Columna de sucursal
    @Column({ nullable: true })
    id_sucursal?: number; //Llave foranea a la tabla Sucursales

    @Column({ default: true })
    is_active: boolean; //Indica si el cliente está activo o no

    //Fecha de creacion
    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;

    //Fecha de actualizacion
    @UpdateDateColumn({ name: 'updated_at' })
    updated_at: Date;

    //Relacion con la tabla Sucursales (Un area puede pertenecer a muchas sucursales)
    @ManyToOne(() => Sucursales, {nullable: true, onDelete: 'CASCADE'})
    @JoinColumn({ name: 'id_sucursal' })
    sucursal?: Sucursales;
}