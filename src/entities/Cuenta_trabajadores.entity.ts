//Modulo de entidad para la tabla empresa
//importaciones necesarias:
import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne, OneToOne } from 'typeorm';

//Definicion de la entidad Cuenta_trabajadores
@Entity('Cuenta_trabajadores')
export class Cuenta_trabajadores {
    //Columna para el ID de la cuenta de trabajador
    @PrimaryGeneratedColumn()
    id_cuenta_t: number; //Llave primaria auto-generada

    //Columna para el id de los equipos
    @Column()
    id_equipos: number; //id de los equipos

    //Columna para el nombre de usuario del trabajador (Maximo 11 caracteres)
    @Column()
    nombre_usuario: string; //Nombre de usuario

    //Columna para el correo
    @Column()
    correo: string; //Correo

    //Columna para la contraseña
    @Column()
    contraseña: string; //Contraseña

    //Columna para el area del trabajador
    @Column()
    area: string; //Area del trabajador

    //Columna para el correo del trabajador
    @Column()
    correoT: string; //Correo del trabajador

    //Columna para la contraseña del trabajador
    @Column()
    contraseñaT: string; //Contraseña del trabajador

    //Columna para la sucursal del trabajador
    @Column()
    sucursal: string; //sucursal del trabajador

    @OneToOne( () => cuenta, empresa => empresa.id_empresa )
    empresa: Empresa;
}