// Servicio para la gestion de hardware

// Importaciones necesarias desde NestJS y TypeORM
import { Injectable, NotFoundException } from '@nestjs/common'; // Decorador para servicios e excepción para manejo de errores
import { InjectRepository } from '@nestjs/typeorm'; // Permite inyectar repositorios de TypeORM
import { Repository } from 'typeorm'; // Clase base para trabajar con la base de datos
import { Hardware } from '../entities/Hardware.entity'; // Entidad Hardware
import { CreateHardwareDto } from './dto/create-hardware.dto'; // DTO para crear hardware
import { RegistroHardware } from '../entities/RegistroHardware.entity'; // Entidad relacionada
import { UpdateHardwareDto } from './dto/update-hardware.dto'; // DTO para actualizar hardware

@Injectable()
export class HardwareService {

  // Constructor donde se inyectan los repositorios de las entidades
  constructor(
    @InjectRepository(Hardware)
    private readonly hardwareRepository: Repository<Hardware>,

    @InjectRepository(RegistroHardware)
    private readonly registroHardwareRepository: Repository<RegistroHardware>,
  ) {}

  // Metodo para crear un nuevo hardware
  create(createHardwareDto: CreateHardwareDto) {
    const hardware = this.hardwareRepository.create(createHardwareDto);
    return this.hardwareRepository.save(hardware);
  }

  // Metodo para obtener todos los registros de hardware
  findAll() {
    return this.hardwareRepository.find();
  }

  // Metodo para obtener un hardware por su ID
  findOne(id: number) {
    return this.hardwareRepository.findOne({ where: { id_hardware: id } });
  }

  // Metodo para actualizar un hardware existente
  async update(id: number, updateHardwareDto: UpdateHardwareDto) {

    // Busca el hardware por su ID
    const hardware = await this.hardwareRepository.findOne({ where: { id_hardware: id } });
    if (!hardware) {
      throw new NotFoundException(`Hardware con id ${id} no encontrado`);
    }

    Object.assign(hardware, updateHardwareDto);

    // Guarda los cambios en la base de datos
    return this.hardwareRepository.save(hardware);
  }

  // Metodo para eliminar un hardware
  async remove(id: number) {

    const hardware = await this.hardwareRepository.findOne({ where: { id_hardware: id } });

    if (!hardware) {
      throw new NotFoundException(`Hardware con id ${id} no encontrado`);
    }
  }
}