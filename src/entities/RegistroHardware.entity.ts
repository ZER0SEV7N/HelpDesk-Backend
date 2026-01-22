//Entidad RegistroHardware
//Definicion de la entidad RegistroHardware
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

//Definicion de la entidad RegistroHardware
@Entity('RegistroHardware')
export class RegistroHardware {

    //Columna para el ID del registro de hardware
    @PrimaryGeneratedColumn()
    id_RH : number; //Llave primaria auto-generada

    //Columna fecha de instalacion
    @Column()
    fecha_instalacion : Date; //Fecha de instalacion del hardware

    //descripcion del hardware
    @Column('text')
    descripcion : string; //Descripcion del hardware instalado

    //Columnna serie del hardware
    @Column({ length: 100 })
    serie : string; //Numero de serie del hardware

    //Columna de proveedor
    @Column()
    proveedor : string; //Proveedor del hardware

    //Relacion con la tabla hardware (Muchos registros de hardware pertenecen a un hardware)
    @ManyToOne(() => RegistroHardware, registroHardware => registroHardware.id_RH)
    @JoinColumn({ name: 'id_RH' })
    registroHardware: RegistroHardware;
}