//src/clientes/entities/persona-natural.entity.ts
//Modulo de entidad para la tabla PersonaNatural
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Equipos } from 'src/entities/Equipos.entity';

//Definicion de la entidad PersonaNatural
@Entity('personaNatural')
export class PersonaNatural {
    //
    @PrimaryGeneratedColumn({ name: 'id_personaN' })
    id_PersonaNatural: number;

    @Column({ length: 8, unique: true })
    dni: string;

    @Column({ length: 100 })
    nombre: string;

    @Column({ length: 20 })
    telefono: string;

    @Column({ length: 100 })
    correo: string;

    @OneToMany(() => Equipos, (equipo) => equipo.personaNatural)
    equipo: Equipos[];
}