//Modulo de entidad para la tabla Hardware
//importaciones necesarias:
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { RegistroHardware } from './RegistroHardware.entity';
//Definicion de la entidad Hardware
@Entity('Hardware')
export class Hardware {
    //Columna para el ID del hardware
    @PrimaryGeneratedColumn({ name: 'id_hardware' })
    id_hardware: number; //Llave primaria auto-generada

    //Columna para el tipo de hardware
    @Column({name: 'tipo_equipo' })
    tipo_equipo: string; //Tipo de hardware (Ejemplo: Laptop, Desktop, Monitor, etc.)

    //Columna para el numero de serie
    @Column({ length: 100 })
    numero_serie: string; //Numero de serie del hardware

    //Columna para la fecha de compra
    @Column({name: 'fecha_compra', type: 'date' })
    fecha_compra: Date; //Fecha de compra del hardware

    //Columna para el Plan de Mantenimiento
    @Column()
    plan: string; //Plan de mantenimiento del hardware

    //Columna para la marca del hardware
    @Column({ length: 50 })
    marca: string; //Marca del hardware

    //Columna para el proveedor del hardware
    @Column()
    proveedor: string; //Proveedor del hardware

    //Columna para la descripcion del hardware
    @Column('text')
    descripcion: string; //Descripcion del hardware

    //Columna de ultima revision
    @Column()
    ult_revision: Date; //Fecha de la ultima revision del hardware

    //Columna de revision programada
    @Column()
    rev_programada: Date; //Fecha de la proxima revision programada

    //Relacion con la tabla RegistroHardware (Un hardware puede tener muchos registros de hardware)
    @ManyToOne(() => RegistroHardware, (rh) => rh.hardwares)
    @JoinColumn({ name: 'id_RH' })
    registroHardware: RegistroHardware;
}