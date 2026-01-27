//Modulo de entidad para la tabla Contactos_Ref
//importaciones necesarias:
import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne } from 'typeorm';
//importar relacion con la empresa
import { Empresa } from './Empresa.entity';
import { MicroEmpresa } from './MicroEmpresa.entity';
import { PersonaNatural } from './Persona_natural.entity';
//Definicion de la entidad Contactos_Ref
@Entity('contactos_ref')
export class Contactos_Ref {
    //Columna para el ID de la empresa
    @PrimaryGeneratedColumn({ name: 'id_contactosref' })
    id_contactosref: number; //Llave primaria auto-generada

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


    //Relacion con la tabla Empresa
    @ManyToOne( () => Empresa, {nullable : true} )
    @JoinColumn( { name: 'id_empresa' } )
    empresa: Empresa;

    //Relacion con la tabla MicroEmpresa
    @ManyToOne( () => MicroEmpresa, {nullable : true} )
    @JoinColumn( { name: 'id_microempresa' } )
    microempresa: MicroEmpresa;

    //Relacion con la tabla persona natural
    @ManyToOne( () => PersonaNatural, {nullable : true} )
    @JoinColumn( { name: 'id_personaN' } )
    persona_natural: PersonaNatural;
}