//Modulo de entidad para la tabla Cliente
//importaciones necesarias:
import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne, OneToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Usuario } from './Usuario.entity';
import { Equipos } from './Equipos.entity';
import { Sucursales } from './Sucursales.entity';
import { Planes } from './Planes.entity';

export enum TipoCliente {
    Juridica = 'JURIDICA',
    Natural = 'NATURAL',
}

//Definicion de la entidad Cliente
@Entity('clientes')
export class Clientes {
    //Columna para el ID del cliente
    @PrimaryGeneratedColumn({name: 'id_cliente'})
    id_cliente: number; //Llave primaria auto-generada

    //Columna del tipo de cliente
    @Column({ type: 'enum', enum: TipoCliente, default: TipoCliente.Juridica })
    tipo_cliente: TipoCliente; //Tipo de cliente (JURIDICA o NATURAL)

    //Columna de numero de documento
    @Column({name: "numero_documento", length: 20, unique: true })
    numero_documento: string; //Número de documento del cliente

    //Columna para el nombre principal
    @Column({name: "nombre_principal", length: 150 })
    nombre_principal: string; //Nombre principal del cliente

    //Columna para la direccion
    @Column({ length: 200, nullable: true })
    direccion: string; //Direccion del cliente

    //Columna para el telefono
    @Column({ length: 20, nullable: true })
    telefono: string; //Telefono del cliente

    //Columna para el correo
    @Column({ length: 100, nullable: true })
    correo: string; //Correo del cliente

    //Columna para el rubro
    @Column({ length: 100, nullable: true })
    rubro: string; //Rubro del cliente (opcional)

    //Columna para el plan
    @Column({ nullable: true })
    id_plan?: number; //ID del plan asociado al cliente

    @ManyToOne(() => Planes, plan => plan.clientes, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'id_plan' })
    plan?: Planes; //Relación con la entidad Planes

    //Columna para la fecha de finalizacion del plan
    @Column({ name: 'fecha_finalizacion_plan', type: 'date', nullable: true })
    fecha_finalizacion_plan: Date; //Fecha de finalización del plan

    //Columna para la fecha de registro del cliente
    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    fecha_registro: Date; //Fecha de registro del cliente

    @Column({ default: true })
    is_active: boolean; //Indica si el cliente está activo o no

    //Fecha de creacion
    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;

    //Fecha de actualizacion
    @UpdateDateColumn({ name: 'updated_at' })
    updated_at: Date;

    //Relacion con la tabla sucursal (Un cliente puede estar asociado a una sucursal)
    @OneToMany(() => Sucursales, (sucursal) => sucursal.cliente)
    sucursales: Sucursales[];

    //Relacion con la tabla Equipos (Un cliente puede tener muchos equipos)
    @OneToMany(() => Equipos, (equipo) => equipo.cliente)
    equipos: Equipos[];

    //Relacion con la tabla Usuario (Un cliente puede tener una cuenta de usuario)
    @OneToMany(() => Usuario, (usuario) => usuario.cliente)
    usuarios: Usuario[];
}