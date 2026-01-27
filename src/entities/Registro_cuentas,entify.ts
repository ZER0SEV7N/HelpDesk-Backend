//Modulo de entidad para la tabla cliente_G
//importaciones necesarias:
import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';

//importar relacion con cliente_G
import { Cliente_G } from './cliente_g.entity';

//Definicion de la entidad Registro_cuentas
@Entity('Registro_cuentas_entify')
export class Registro_cuentas_entify {
    //Columna para el ID de los registros de cuentas
    @PrimaryGeneratedColumn()
    id_registro_cuentas: number; //Llave primaria auto-generada

    //Columna para el id del cliente_G
    @Column()
    id_cliente: number; //Id del cliente

    //Columna para correo
    @Column()
    correo: string; //Correo del cliente

    //Columna para contraseña
    @Column()
    contraseña: string; //Contraseña del cliente

    //Relacion con la tabla Sucursales (Un empresa puede tener muchas sucursales)
    @OneToOne( () => Cliente_G, (cliente) => cliente.id_clienteG)
    cliente: Cliente_G;
}