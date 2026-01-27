//Modulo de entidad para la tabla Cliente_G
//importaciones necesarias:
import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { RegistroDeCuentas } from './RegistroDeCuentas.entity';
//Definicion de la entidad Cliente_G
@Entity('Cliente_G')
export class Cliente_G {
    //Columna para el ID del cliente
    @PrimaryGeneratedColumn({name: 'id_clienteG '})
    id_clienteG: number; //Llave primaria auto-generada

    //Columna para el nombre del cliente
    @Column({ length: 100 })
    nombre: string; //Nombre del cliente

    //Columna para el apellido del cliente
    @Column({ length: 100 })
    apellido: string; //Apellido del cliente

    //Columna para la direccion
    @Column({ length: 200 })
    direccion: string; //Direccion del cliente

    //Columna para el correo
    @Column({ length: 100 })
    correo: string; //Correo del cliente

    //Columna para el numero telefonico (Maximo 20 caracteres)
    @Column({ name: 'num_telefonico', length: 20 })
    num_telefonico: string; //Numero telefonico del cliente

    //Columna para el numero plan
    @Column({ name: 'numero_plan', length: 50 })
    numero_plan: string; //Numero plan del cliente

    //Columna para el cargo
    @Column({ length: 100 })
    cargo: string; //Cargo del cliente

    //Relacion con la tabla RegistroDeCuentas (uno a uno)
    @OneToOne(() => RegistroDeCuentas, (cuenta) => cuenta.clienteG)
    cuenta: RegistroDeCuentas;
}