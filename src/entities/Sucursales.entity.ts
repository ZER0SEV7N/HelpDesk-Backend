//Entidad Sucursal
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, JoinColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Clientes } from './Clientes.entity';
import { Equipos } from './Equipos.entity';
import { Usuario } from './Usuario.entity';
import { Area } from './Area.entity';

//Definicion de la entidad Sucursal
@Entity('Sucursales')
export class Sucursales {
    //Columna para el ID de la sucursal
    @PrimaryGeneratedColumn()
    id_sucursal: number; //Llave primaria auto-generada

    //Columna para el nombre de la sucursal
    @Column()
    nombre_sucursal: string; //Nombre de la sucursal

    //Columna de encargado de la sucursal
    @Column()
    encargado: string; //Encargado de la sucursal

    //Columna para el telefono de la sucursal
    @Column({ length: 20 })
    telefono: string; //Telefono de la sucursal

    //Columna para el correo de la sucursal
    @Column()
    correo: string; //Direccion de correo de la sucursal

    //Columna para la direccion
    @Column()
    direccion: string;

    //Columna para el Id de cliente
    @Column()
    id_cliente: number; //Llave foranea a la tabla Cliente

    @Column({ default: true })
    is_active: boolean; //Indica si el cliente está activo o no

    //Fecha de creacion
    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;

    //Fecha de actualizacion
    @UpdateDateColumn({ name: 'updated_at' })
    updated_at: Date;

    //Relacion con la tabla Cliente (Una sucursal pertenece a un cliente)
    @ManyToOne(() => Clientes, (cliente) => cliente.sucursales, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_cliente' })
    cliente: Clientes;

    //Relacion con la tabla Equipos (Una sucursal puede tener muchos equipos)
    @OneToMany(() => Equipos, (equipo) => equipo.sucursal)
    equipos: Equipos[];

    //Relacion con la tabla Usuario (Una sucursal puede tener muchos usuarios)
    @OneToMany(() => Usuario, (usuario) => usuario.sucursal)
    usuarios: Usuario[];

    //Relacion con la tabla Area (Una sucursal puede tener muchas areas)
    @OneToMany(() => Area, (area) => area.sucursal)
    areas: Area[];
}