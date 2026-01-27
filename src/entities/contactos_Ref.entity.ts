//Modulo de entidad para la tabla Contactos_Ref
//importaciones necesarias:
import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne } from 'typeorm';

//importar relacion con la empresa
import { Empresa } from './empresa.entity';

//Definicion de la entidad Contactos_Ref
@Entity('Contactos_Ref')
export class Contactos_Ref {
    //Columna para el ID de la empresa
    @PrimaryGeneratedColumn({ name: 'id_contactosref' })
    id_contactosref: number; //Llave primaria auto-generada

    //Columna para el ID de la empresa
    @Column()
    id_empresa: number; //ID de la empresa

    //Columna para el ID de la microempresa
    @Column()
    id_microempresa: number; //id de la microempresa

    //Columna para el id de la persona natural
    @Column()
    id_personanatural: number; //id de la persona natural

    //Columna para el telefono
    @Column()
    telefono: string; //Telefono de la Empresa

    //Columna para el nombre de la empresa
    @Column()
    nombre: string; //Nombre de la empresa

    //Columna para la direccion de la empresa
    @Column()
    direccion: string; //Direccion de la empresa

    //Columna para el correo de la empresa
    @Column()
    correo: string; //Correo de la empresa


    //Columna para el cargo
    @Column()
    cargo: string; //cargo


    //Relacion con la tabla Sucursales (Un empresa puede tener muchas sucursales)
    @ManyToOne( () => Empresa, empresa => empresa.id_empresa )
    @JoinColumn( { name: 'id_empresa' } )
    empresa: Empresa;
}