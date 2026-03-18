//src/entities/Rol.entity.ts
//Modulo de entidad para la tabla Rol
//importaciones necesarias:
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn } from 'typeorm';
import { Usuario } from './Usuario.entity';
//Definicion de la entidad Rol

//ROLES:
//1 - ADMININISTRADOR
//2 - SOPORTE_TECNICO
//3 - SOPORTE_INSITU
//4 - CLIENTE_EMPRESA
//5 - CLIENTE_SUCURSAL
//6 - CLIENTE_TRABAJADOR
@Entity('rol')
export class Rol {
    //Columna para el ID del rol
    @PrimaryGeneratedColumn({ name: 'id_rol' })
    id_rol: number; //Llave primaria auto-generada

    //Columna para el nombre del rol
    @Column({ length: 50 })
    nombre: string; //Nombre del rol
    
    //Relacion con la tabla Usuario (uno a muchos)
    @OneToMany(() => Usuario, (usuario) => usuario.rol)
    usuarios: Usuario[];

    //Fecha de creacion
    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;
}