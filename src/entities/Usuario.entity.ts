//src/entities/Usuario.entity.ts
//Modulo de entidad para la tabla Usuario
//importaciones necesarias:
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Rol } from './Rol.entity';
import { Tickets } from './Tickets.entity';
import { Clientes } from './Clientes.entity';
import { Sucursales } from './Sucursales.entity';

//Definicion de la entidad Usuario
@Entity('usuarios')
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
    contraseña: string;

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

    //Fecha de creacion
    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;

    //Fecha de actualizacion
    @UpdateDateColumn({ name: 'updated_at' })
    updated_at: Date;

    @Column({ nullable: true })
    id_cliente?: number; //Llave foranea a la tabla Cliente

    //Relacion con la tabla Cliente (muchos a uno)
    @ManyToOne(() => Clientes, (cliente) => cliente.usuarios)
    @JoinColumn({ name: 'id_cliente' })
    cliente?: Clientes;

    @Column({ nullable: true })
    id_sucursal?: number; //Llave foranea a la tabla Sucursales

    //Relacion con la tabla Sucursales (muchos a uno)
    @ManyToOne(() => Sucursales, (sucursal) => sucursal.usuarios)
    @JoinColumn({ name: 'id_sucursal' })
    sucursal?: Sucursales;

    @OneToMany(() => Tickets, ticket => ticket.soporte)
    tickets_soporte: Tickets[];
}