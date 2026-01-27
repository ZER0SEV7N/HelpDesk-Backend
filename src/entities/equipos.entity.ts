//src/entities/Equipos.entity.ts
//Modulo de entidad para la tabla Equipos
//importaciones necesarias:
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
//importar relaciones foraneas
import { Empresa } from './Empresa.entity';
import { MicroEmpresa } from './MicroEmpresa.entity';
import { Planes } from './planes.entity';
import { Ticket } from './tickets.entity';
import { PersonaNatural } from './persona_natural.entity';

//Definicion