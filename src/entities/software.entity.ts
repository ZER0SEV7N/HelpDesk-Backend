//Modulo de entidad para la tabla Software
//importaciones necesarias:
import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne } from 'typeorm';

//Definicion de la entidad Software
@Entity('Software')
export class Software {
    //Columna para el ID de la empresa
    @PrimaryGeneratedColumn()
    id_software: number; //Llave primaria auto-generada

    //Columna para el nombre del Software
    @Column()
    nombre_software: string; //Nombre del Software

    //Columna para la licencia del Software
    @Column()
    licencia: string; //Licencia del Software

    //Columna para el Correo
    @Column()
    correo: string; //Correo del Software

    //Columna para la contraseña
    @Column()
    contraseña: string; //Contraseña del Software

    //Columna para la fecha de instalacion
    @Column()
    fecha_instalacion: Date; //Fecha de instalacion del Software

    //Columna para la fecha de caducidad
    @Column()
    fecha_caducidad: Date; //Fecha de caducidad del Software

    //Columna para el proveedor
    @Column()
    proveedor: Date; //Proveedor del Software

    //Relacion con la tabla Sucursales (Un empresa puede tener muchas sucursales)
    //ManyToOne
    //@ManyToOne( () => Empresa, empresa => empresa.id_empresa )
    //@JoinColumn( { name: 'id_empresa' } )
    //empresa: Empresa;
}