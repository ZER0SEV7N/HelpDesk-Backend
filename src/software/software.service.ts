import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSoftwareDto } from './dto/create-software.dto';
import { UpdateSoftwareDto } from './dto/update-software.dto';
import { Software } from '../entities/Software.entity';
import { Software_equipos } from 'src/entities/SoftwareEquipos.entity';
import { Equipos } from 'src/entities/Equipos.entity';

@Injectable()
export class SoftwareService {
  constructor(
    @InjectRepository(Software)
    private readonly softwareRepo: Repository<Software>,

    //Inyectamos la tabla intermedia enriquecida
    @InjectRepository(Software_equipos)
    private readonly softwareEquiposRepo: Repository<Software_equipos>,

    //Inyectamos Equipos para validar antes de instalar
    @InjectRepository(Equipos)
    private readonly equiposRepo: Repository<Equipos>,
  ) {}

  //Crear un nuevo registro de software
  async create(createSoftwareDto: CreateSoftwareDto) {
    const instalacion = new Date(createSoftwareDto.fecha_instalacion)
    const caducidad = new Date(createSoftwareDto.fecha_caducidad)

    if (isNaN(instalacion.getTime()) || isNaN(caducidad.getTime())) {
      throw new BadRequestException('Fechas inválidas. Asegúrate de que sean strings en formato ISO.');
    }
    //Convertimos las fechas de string a Date para que TypeORM acepte los valores
    const dtoWithDates: Partial<Software> = {
      ...createSoftwareDto,
      fecha_instalacion: instalacion ,
      fecha_caducidad: caducidad,
    };

    // Creamos la entidad a partir del DTO
    const software = this.softwareRepo.create(dtoWithDates);
    // Guardamos la entidad en la base de datos
    return this.softwareRepo.save(software);
  }

  // Obtener todos los registros de software
  async findAll() {
    return this.softwareRepo.find({
        where: { is_active: true }
    });
  }

  // Obtener un registro de software por ID
  async findOne(id: number) {
    const software = await this.softwareRepo.findOne({
        where: { id_software: id },
        relations: ['se', 'se.equipo'] 
    });

    if (!software) throw new NotFoundException(`Software con id ${id} no encontrado`);
    

    return software;
  }

  // Actualizar un registro de software
  async update(id: number, updateSoftwareDto: UpdateSoftwareDto) {
    const dtoWithDates: Partial<Software> = {
      ...(updateSoftwareDto as any),
      ...(updateSoftwareDto.fecha_instalacion ? { fecha_instalacion: new Date(updateSoftwareDto.fecha_instalacion) } : {}),
      ...(updateSoftwareDto.fecha_caducidad ? { fecha_caducidad: new Date(updateSoftwareDto.fecha_caducidad) } : {}),
    };

    const software = await this.softwareRepo.preload({
      id_software: id,
      ...dtoWithDates,
    });

    if (!software) {
      throw new NotFoundException(`Software con id ${id} no encontrado`);
    }

    return this.softwareRepo.save(software);
  }

  // Eliminar un registro de software
  async remove(id: number) {
    const software = await this.findOne(id);
    
    if (!software.is_active) throw new BadRequestException('El software ya se encuentra inactivo');
    
    software.is_active = false;
    await this.softwareRepo.save(software);

    return { message: `Software con id ${id} desactivado correctamente` };
  }

  //Método para instalar un software en un equipo
  async installSoftware(id_software: number, id_equipo: number, licencia_asignada: string, observaciones: string) {
    const software = await this.findOne(id_software);
      if (!software.is_active) throw new BadRequestException('Este software está inactivo o la licencia caducó.');

      const equipo = await this.equiposRepo.findOneBy({ id_equipo });
      if (!equipo) throw new NotFoundException(`El equipo con ID ${id_equipo} no existe.`);

      const yaInstalado = await this.softwareEquiposRepo.findOne({
            where: { 
                soft: { id_software: id_software }, 
                equipo: { id_equipo: id_equipo },
                is_active: true // Solo revisamos instalaciones que sigan activas
            }
        });

        if (yaInstalado) {
            throw new ConflictException(`El software ${software.nombre_software} ya se encuentra instalado en el equipo ${equipo.numero_serie}.`);
        }

      const nuevaInstalacion = this.softwareEquiposRepo.create({
          soft: software,
          equipo: equipo,
          licencia_asignada: licencia_asignada,
          observaciones: observaciones
      });

      return await this.softwareEquiposRepo.save(nuevaInstalacion);
  }
}