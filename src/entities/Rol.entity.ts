//src/entities/Rol.entity.ts
//Modulo de entidad para la tabla Rol
//importaciones necesarias:
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Usuario } from './Usuario.entity';
//Definicion de la entidad Rol
@Entity('rol')
export class Rol {
    //Columna para el ID del rol
    @PrimaryGeneratedColumn({ name: 'id_rol' })
    id_rol: number; //Llave primaria auto-generada

    //Columna para el nombre del rol
    @Column({ length: 50 })
    nombre: string; //Nombre del rol

    //Columna para el nivel de seguridad
    @Column()
    nivel_seguridad: number; //Nivel de seguridad del rol

    //Relacion con la tabla Usuario (uno a muchos)
    @OneToMany(() => Usuario, (usuario) => usuario.rol)
    usuarios: Usuario[];
}