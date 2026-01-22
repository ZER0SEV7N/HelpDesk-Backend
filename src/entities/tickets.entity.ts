//Modulo de entidad para la tabla empresa
//importaciones necesarias:
import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne } from 'typeorm';

//Definicion de la entidad Tickets
@Entity('Empresa')
export class Tickets {
    //Columna para el ID de Tickets
    @PrimaryGeneratedColumn()
    id_tickets: number; //Llave primaria auto-generada

    //Columna para el ID de equipos
        @PrimaryGeneratedColumn()
    id_equipos: number; //Llave primaria auto-generada

    //Columna para el tipo de incidente
    @Column()
    tipo_incidente: string; //Tipo de incidente

    //Columna para el nombre del cliente
    @Column()
    nombre_cliente: string; //Nombre del cliente

    //Columna para el nombre de la empresa
    @Column()
    nombre_empresa: string; //Nombre de la empresa

    //Columna para el nombre del area
    @Column()
    area: string; //Nombre del area

    //Columna para para el nombre del sucursal
    @Column()
    sucursal: string; //Nombre de la sucursal

    //Columna para el estado del ticket
    @Column()
    estado: string; //Estado del ticket

    //Columnna para la fecha de registro 
    @Column()
    fecha_registro: Date; //Fecha de registro del ticket


    //Relacion con la tabla Sucursales (Un empresa puede tener muchas sucursales)
    //ManyToOne
    @ManyToOne( () => Empresa, empresa => empresa.id_empresa )
    @JoinColumn( { name: 'id_empresa' } )
    empresa: Empresa;
}