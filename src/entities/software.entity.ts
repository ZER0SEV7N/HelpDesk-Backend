//Modulo de entidad para la tabla Software
//importaciones necesarias:
import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Software_equipos } from './Software_equipos.entity'; // Importa la entidad relacionada

//Definicion de la entidad Software
@Entity('software')
export class Software {
    //Columna para el ID del Software
    @PrimaryGeneratedColumn()
    id_software: number; //Llave primaria auto-generada

    //Columna para el nombre del Software
    @Column({ length: 100 })
    nombre_software: string; //Nombre del Software

    //Columna para la licencia del Software
    @Column({ length: 100})
    licencia: string; //Licencia del Software

    //Columna para el Correo
    @Column({ length: 100 })
    correo: string; //Correo del Software

    //Columna para la contraseña
    @Column({ length: 255 })
    contraseña: string; //Contraseña del Software

    //Columna para la fecha de instalacion
    @Column({ name: 'fecha_instalacion', type: 'date' })
    fecha_instalacion: Date; //Fecha de instalacion del Software

    //Columna para la fecha de caducidad
    @Column({ name: 'fecha_caducidad', type: 'date' })
    fecha_caducidad: Date; //Fecha de caducidad del Software

    //Columna para el proveedor
    @Column({ length: 100 })
    proveedor: string; //Proveedor del Software

    //Relacion con la tabla Software_equipos (Un software puede estar en muchos equipos)
    @OneToMany(() => Software_equipos, (se) => se.soft)
    se: Software_equipos[];

    //Fecha de creacion
    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;

    //Fecha de actualizacion
    @UpdateDateColumn({ name: 'updated_at' })
    updated_at: Date;
}