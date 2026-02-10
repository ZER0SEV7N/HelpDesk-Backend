//src/entities/Usuario.entity.ts
//Modulo de entidad para la tabla Usuario
//importaciones necesarias:
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Rol } from './Rol.entity';

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
    @Column({ length: 15 })
    telefono: string; //Telefono del usuario

    //Columna para estado
    @Column()
    is_active: boolean; //Estado del usuario

    //Relacion con la tabla Rol (muchos a uno)
    @ManyToOne(() => Rol, (rol) => rol.usuarios)
    @JoinColumn({ name: 'id_rol' })
    rol: Rol;
}