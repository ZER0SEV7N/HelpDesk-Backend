// src/equipos/equipos.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Equipos } from '../entities/Equipos.entity';
import { CreateEquipoDTO } from './dto/create-equipos.dto';
import { UpdateEquipoDto } from './dto/update-equipos.dto';

// Importa las entidades Hardware y Software
import { Hardware } from '../entities/Hardware.entity';
import { Software } from '../entities/Software.entity';

@Injectable()
export class EquiposService {
  constructor(
    @InjectRepository(Equipos)
    private readonly equiposRepository: Repository<Equipos>,

    @InjectRepository(Hardware)
    private readonly hardwareRepository: Repository<Hardware>,

    @InjectRepository(Software)
    private readonly softwareRepository: Repository<Software>,
  ) {}

  // Crear un nuevo equipo
  async create(createEquipoDto: CreateEquipoDTO) {
    const equipo = this.equiposRepository.create(createEquipoDto as Partial<Equipos>);

    // --- Asignar hardware si se proporcionan IDs ---
    if (createEquipoDto.hardwareIds && createEquipoDto.hardwareIds.length > 0) {
      const hardwares = await this.hardwareRepository.find({
        where: { id_hardware: In(createEquipoDto.hardwareIds) },
      });
      equipo.hardware = hardwares;
    }

    // --- Asignar software si se proporcionan IDs ---
    if (createEquipoDto.softwareIds && createEquipoDto.softwareIds.length > 0) {
      const softwares = await this.softwareRepository.find({
        where: { id_software: In(createEquipoDto.softwareIds) },
      });
      equipo.software = softwares;
    }

    return this.equiposRepository.save(equipo);
  }

  // Listar todos los equipos
  async findAll() {
    return this.equiposRepository.find({ relations: ['hardware', 'software'] });
  }

  // Obtener un equipo por ID
  async findOne(id: number) {
    const equipo = await this.equiposRepository.findOne({
      where: { id_equipo: id },
      relations: ['hardware', 'software'],
    });
    if (!equipo) {
      throw new NotFoundException(`Equipo con id ${id} no encontrado`);
    }
    return equipo;
  }

  // Actualizar un equipo existente
  async update(id: number, updateEquipoDto: UpdateEquipoDto) {
    const equipo = await this.equiposRepository.preload({
      id_equipo: id,
      ...(updateEquipoDto as Partial<Equipos>),
    });
    if (!equipo) {
      throw new NotFoundException(`Equipo con id ${id} no encontrado`);
    }

    // --- Actualizar hardware si se proporcionan IDs ---
    if (updateEquipoDto.hardwareIds) {
      const hardwares = await this.hardwareRepository.find({
        where: { id_hardware: In(updateEquipoDto.hardwareIds) },
      });
      equipo.hardware = hardwares;
    }

    // --- Actualizar software si se proporcionan IDs ---
    if (updateEquipoDto.softwareIds) {
      const softwares = await this.softwareRepository.find({
        where: { id_software: In(updateEquipoDto.softwareIds) },
      });
      equipo.software = softwares;
    }

    return this.equiposRepository.save(equipo);
  }

  // Eliminar un equipo
  async remove(id: number) {
    const equipo = await this.findOne(id);
    await this.equiposRepository.remove(equipo);
    return { message: `Equipo con id ${id} eliminado correctamente` };
  }
}