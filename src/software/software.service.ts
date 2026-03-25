import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSoftwareDto } from './dto/create-software.dto';
import { UpdateSoftwareDto } from './dto/update-software.dto';
import { Software } from '../entities/Software.entity';

@Injectable()
export class SoftwareService {
  constructor(
    @InjectRepository(Software)
    private readonly softwareRepository: Repository<Software>,
  ) {}

  // Crear un nuevo registro de software
  async create(createSoftwareDto: CreateSoftwareDto) {
    // Convertimos las fechas de string a Date para que TypeORM acepte los valores
    const dtoWithDates: Partial<Software> = {
      ...createSoftwareDto,
      fecha_instalacion: new Date(createSoftwareDto.fecha_instalacion),
      fecha_caducidad: new Date(createSoftwareDto.fecha_caducidad),
    };

    // Creamos la entidad a partir del DTO
    const software = this.softwareRepository.create(dtoWithDates);
    // Guardamos la entidad en la base de datos
    return this.softwareRepository.save(software);
  }

  // Obtener todos los registros de software
  async findAll() {
    return this.softwareRepository.find();
  }

  // Obtener un registro de software por ID
  async findOne(id: number) {
    const software = await this.softwareRepository.findOneBy({ id_software: id });

    if (!software) {
      throw new NotFoundException(`Software con id ${id} no encontrado`);
    }

    return software;
  }

  // Actualizar un registro de software
  async update(id: number, updateSoftwareDto: UpdateSoftwareDto) {
    const dtoWithDates: Partial<Software> = {
      ...(updateSoftwareDto as any),
      ...(updateSoftwareDto.fecha_instalacion
        ? { fecha_instalacion: new Date(updateSoftwareDto.fecha_instalacion) }
        : {}),
      ...(updateSoftwareDto.fecha_caducidad
        ? { fecha_caducidad: new Date(updateSoftwareDto.fecha_caducidad) }
        : {}),
    };

    const software = await this.softwareRepository.preload({
      id_software: id,
      ...dtoWithDates,
    });

    if (!software) {
      throw new NotFoundException(`Software con id ${id} no encontrado`);
    }

    return this.softwareRepository.save(software);
  }

  // Eliminar un registro de software
  async remove(id: number) {
    const software = await this.findOne(id);
    await this.softwareRepository.remove(software);

    return {
      message: `Software con id ${id} eliminado correctamente`,
    };
  }
}