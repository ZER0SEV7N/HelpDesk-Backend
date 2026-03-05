// Entidad TypeORM legacy (referencia); la app usa Mongoose (schemas/user.schema.ts).
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Rol } from './Rol.entity';

@Entity('usuario')
export class Usuario {
    @PrimaryGeneratedColumn({ name: 'id_usuario' })
    id_usuario: number;

    @Column({ length: 50 })
    nombre: string;

    @Column({ length: 50 })
    apellido: string;

    @Column()
    correo: string;

    @Column({ name: 'contraseña' })
    contrasena: string;

    @Column({ length: 15 })
    telefono: string;

    @Column()
    is_active: boolean;

    @ManyToOne(() => Rol, (rol) => rol.usuarios)
    @JoinColumn({ name: 'id_rol' })
    rol: Rol;
}