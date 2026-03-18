import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('software')
export class Software {
	@PrimaryGeneratedColumn({ name: 'id_software' })
	id_software: number;

	@Column({ name: 'nombre_software', type: 'varchar', length: 150 })
	nombre_software: string;

	@Column({ type: 'varchar', length: 120 })
	licencia: string;

	@Column({ type: 'varchar', length: 150 })
	correo: string;

	@Column({ type: 'varchar', length: 255 })
	contraseña: string;

	@Column({ name: 'fecha_instalacion', type: 'date' })
	fecha_instalacion: Date;

	@Column({ name: 'fecha_caducidad', type: 'date' })
	fecha_caducidad: Date;

	@Column({ type: 'varchar', length: 120 })
	proveedor: string;
}
