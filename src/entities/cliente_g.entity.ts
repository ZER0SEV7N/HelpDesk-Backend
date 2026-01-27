//Modulo de entidad para la tabla Cliente_G
//importaciones necesarias:
import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne } from 'typeorm';

//Definicion de la entidad Cliente_G
@Entity('Cliente_G')
export class Cliente_G {
    //Columna para el ID del cliente
    @PrimaryGeneratedColumn()
    id_clienteG: number; //Llave primaria auto-generada

    //Columna para el nombre del cliente
    @Column()
    nombre: string; //Nombre del cliente

    //Columna para el apellido del cliente
    @Column()
    apellido: string; //Apellido del cliente

    //Columna para la direccion
    @Column()
    direccion: string; //Direccion del cliente

    //Columna para el correo
    @Column()
    correo: string; //Correo del cliente

    //Columna para el numero telefonico (Maximo 20 caracteres)
    @Column({ length: 20 })
    num_telefonico: string; //Numero telefonico del cliente

    //Columna para el numero plan
    @Column()
    num_plan: string; //Numero plan del cliente

    //Columna para el cargo
    @Column()
    cargo: string; //Cargo del cliente



    //Relacion con la tabla Sucursales (Un empresa puede tener muchas sucursales)
    //ManyToOne
    //@ManyToOne( () => Empresa, empresa => empresa.id_empresa )
    //@JoinColumn( { name: 'id_empresa' } )
    //empresa: Empresa;
}