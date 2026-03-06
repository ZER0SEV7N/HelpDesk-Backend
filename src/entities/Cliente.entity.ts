//Modulo de entidad para la tabla Cliente
//importaciones necesarias:
import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne, OneToOne, OneToMany } from 'typeorm';
import { Usuario } from './Usuario.entity';
import { Equipos } from './Equipos.entity';
import { Sucursales } from './Sucursales.entity';

export enum TipoCliente {
    Juridica = 'Juridica',
    Natural = 'Natural',
}

//Definicion de la entidad Cliente
@Entity('cliente')
export class Cliente {
    //Columna para el ID del cliente
    @PrimaryGeneratedColumn({name: 'id_cliente'})
    id_cliente: number; //Llave primaria auto-generada

    //Columna del tipo de cliente
    @Column({ type: 'enum', enum: TipoCliente, default: TipoCliente.Natural })
    tipo_cliente: TipoCliente; //Tipo de cliente (JURIDICA o NATURAL)

    //Columna de numero de documento
    @Column({name: "numero_documento", length: 20, unique: true })
    numero_documento: string; //Número de documento del cliente

    //Columna para el nombre principal
    @Column({name: "nombre_principal", length: 150 })
    nombre_principal: string; //Nombre principal del cliente

    //Columna para la direccion
    @Column({ length: 200 })
    direccion: string; //Direccion del cliente

    //Columna para el telefono
    @Column({ length: 20 })
    telefono: string; //Telefono del cliente

    //Columna para el correo
    @Column({ length: 100 })
    correo: string; //Correo del cliente

    //Columna para el rubro
    @Column({ length: 100, nullable: true })
    rubro: string; //Rubro del cliente (opcional)

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