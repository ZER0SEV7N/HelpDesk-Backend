//src/entities/Usuario.entity.ts
//Modulo de entidad para la tabla Usuario
//importaciones necesarias:
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Rol } from './Rol.entity';
import { Cliente } from './Cliente.entity';
import { Sucursales } from './Sucursales.entity';

//Definicion de la entidad Usuario
@Entity('usuario')
export class Usuario {
    //Columna para el ID del usuario
    @PrimaryGeneratedColumn({ name: 'id_usuario' })
    id_usuario: number; //Llave primaria auto-generada

    //Columna para el nombre de usuario
    @Column({ length: 50 })
    nombre: string; //Nombre de usuario

    //Columna para apellido de usuario
    @Column({ length: 50 })
    apellido: string; //Apellido de usuario

    //Columna para el correo electronico
    @Column()
    correo: string; //Correo electronico del usuario

    //Columna para la contrasena
    @Column({ name: 'contraseña' })
    contrasena: string;

    //Columna para telefono
    @Column({ length: 15, nullable: true })
    telefono: string; //Telefono del usuario

    //Columna para estado
    @Column( {default: true } )
    is_active: boolean; //Estado del usuario

    //Relacion con la tabla Rol (muchos a uno)
    @ManyToOne(() => Rol, (rol) => rol.usuarios)
    @JoinColumn({ name: 'id_rol' })
    rol: Rol;

    @Column({ nullable: true })
    id_cliente?: number; //Llave foranea a la tabla Cliente

    //Relacion con la tabla Cliente (muchos a uno)
    @ManyToOne(() => Cliente, (cliente) => cliente.usuarios)
    @JoinColumn({ name: 'id_cliente' })
    cliente?: Cliente;

    @Column({ nullable: true })
    id_sucursal?: number; //Llave foranea a la tabla Sucursales

    //Relacion con la tabla Sucursales (muchos a uno)
    @ManyToOne(() => Sucursales, (sucursal) => sucursal.usuarios)
    @JoinColumn({ name: 'id_sucursal' })
    sucursal?: Sucursales;
}