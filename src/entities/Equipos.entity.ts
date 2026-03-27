//src/entities/Equipos.entity.ts
//Modulo de entidad para la tabla Equipos
//importaciones necesarias:
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
//importar relaciones foraneas
import { Planes } from './Planes.entity';
import { Tickets } from './Tickets.entity';
import { Clientes } from './Clientes.entity';
import { Sucursales } from './Sucursales.entity';

//Definicion de la entidad Equipos
@Entity('equipos')
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
    @Column({ name: 'nombre_usuario', length: 100, nullable: true})
    nombre_usuario: string; //Nombre de usuario del equipo

    //Columna de Area de trabajo
    @Column({ name: 'area', length: 100, nullable: true })
    area: string; //Area de trabajo del equipo

    // Fechas importantes para el módulo de "Cronograma de Citas"
    @Column({ name: 'ult_revision', type: 'date', nullable: true })
    ultRevision: Date;

    @Column({ name: 'rev_programada', type: 'date', nullable: true })
    revProgramada: Date;

    @Column({ default: true })
    is_active: boolean; //Indica si el cliente está activo o no

    //Relaciones Polimorficas
    @Column()
    id_cliente: number;

    @ManyToOne(() => Clientes, (cliente) => cliente.equipos, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_cliente' })
    cliente: Clientes;

    @Column({ nullable: true })
    id_sucursal?: number;

    @ManyToOne(() => Sucursales, (sucursal) => sucursal.equipos, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'id_sucursal' })
    sucursal?: Sucursales;

    @Column({ nullable: true })
    id_plan?: number;

    @ManyToOne(() => Planes, { nullable: true })
    @JoinColumn({ name: 'id_plan' })
    plan?: Planes;

    //Fecha de creacion
    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;

    //Fecha de actualizacion
    @UpdateDateColumn({ name: 'updated_at' })
    updated_at: Date;

    @OneToMany(() => Tickets, ticket => ticket.equipo)
    ticket: Tickets[];
}
