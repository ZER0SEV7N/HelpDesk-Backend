//src/entities/Equipos.entity.ts
//Modulo de entidad para la tabla Equipos
//importaciones necesarias:
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
//importar relaciones foraneas
import { Empresa } from './Empresa.entity';
import { MicroEmpresa } from './MicroEmpresa.entity';
import { Planes } from './planes.entity';
import { Ticket } from './Tickets.entity';
import { PersonaNatural } from './persona_natural.entity';

//Definicion de la entidad Equipos
@Entity('Equipos')
export class Equipos {
    //Columna para el ID del equipo
    @PrimaryGeneratedColumn({ name: 'id_equipo' })
    id_equipo: number; //Llave primaria auto-generada

    //Columna para el tipo de equipo
    @Column({ length: 50})
    tipo: string; //Tipo de equipo

    //Columna para la marca del equipo
    @Column({ length: 50})
    marca: string; //Marca del equipo

    //Columna para el numero de serie
    @Column({ name: 'num_serie', length: 100})
    numero_serie: string; //Numero de serie del equipo

    //Columna para el nombre de usuario
    @Column({ name: 'nombre_usuario', length: 100})
    nombre_usuario: string; //Nombre de usuario del equipo

    //Columna de Area de trabajo
    @Column({ name: 'area', length: 100})
    area: string; //Area de trabajo del equipo

    // Fechas importantes para el módulo de "Cronograma de Citas"
    @Column({ name: 'ult_revision', type: 'date', nullable: true })
    ultRevision: Date;

    @Column({ name: 'rev_programada', type: 'date', nullable: true })
    revProgramada: Date;

    //Relaciones Polimorficas

    //Relacion con la tabla Empresa (Muchos equipos pueden pertenecer a una empresa)
    @ManyToOne(() => Empresa, {nullable: true})
    @JoinColumn({ name: 'id_empresa' })
    empresa: Empresa;

    //Relacion con la tabla MicroEmpresa (Muchos equipos pueden pertenecer a una microempresa)
    @ManyToOne(() => MicroEmpresa, {nullable: true})
    @JoinColumn({ name: 'id_microempresa' })
    microEmpresa: MicroEmpresa;

    //Relacion con la tabla Planes (Muchos equipos pueden tener un plan)
    @ManyToOne(() => Planes, {nullable: true})
    @JoinColumn({ name: 'id_plan' })
    plan: Planes;

    //Relacion con la tabla PersonaNatural (Muchos equipos pueden pertenecer a una persona natural)
    @ManyToOne(() => PersonaNatural, {nullable: true})
    @JoinColumn({ name: 'id_personanatural' })
    personaNatural: PersonaNatural;

    //Relacion con la tabla Tickets (Un equipo puede tener muchos tickets)
    @OneToMany(() => Ticket, ticket => ticket.equipo)
    tickets: Ticket[];
}