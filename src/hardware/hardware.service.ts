// Servicio para la gestion de hardware

// Importaciones necesarias desde NestJS y TypeORM
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'; // Decorador para servicios e excepción para manejo de errores
import { InjectRepository } from '@nestjs/typeorm'; // Permite inyectar repositorios de TypeORM
import { Repository } from 'typeorm'; // Clase base para trabajar con la base de datos
import { Hardware } from '../entities/Hardware.entity'; // Entidad Hardware
import { CreateHardwareDto } from './dto/create-hardware.dto'; // DTO para crear hardware
import { RegistroHardware } from '../entities/RegistroHardware.entity'; // Entidad relacionada
import { UpdateHardwareDto } from './dto/update-hardware.dto'; // DTO para actualizar hardware
import { Equipos } from 'src/entities/Equipos.entity';

@Injectable()
export class HardwareService {

  // Constructor donde se inyectan los repositorios de las entidades
  constructor(
    @InjectRepository(Hardware)
    private readonly hardwareRepo: Repository<Hardware>,

    @InjectRepository(RegistroHardware)
    private readonly regHardRepo: Repository<RegistroHardware>,
  
    @InjectRepository(Equipos)
    private readonly equiposRepo: Repository<Equipos>,
  ) {}

  // Metodo para crear un nuevo hardware
  async create(createHardwareDto: CreateHardwareDto) {
    const hardware = this.hardwareRepo.create(createHardwareDto);
    return await this.hardwareRepo.save(hardware);
  }

  // Metodo para obtener todos los registros de hardware
  async findAll() {
    return await this.hardwareRepo.find({
      where: { is_active: true }
    });
  }

  // Metodo para obtener un hardware por su ID
  async findOne(id: number) {
    const hardware = await this.hardwareRepo.findOne({ 
            where: { id_hardware: id },
            relations: ['registros', 'registros.equipo'] // Trae el historial y el nombre de la PC
        });

      if (!hardware) throw new NotFoundException(`Hardware con id ${id} no encontrado`);
      return hardware;
  }

  // Metodo para actualizar un hardware existente
  async update(id: number, dto: UpdateHardwareDto) {

    const hardware = await this.findOne(id); // Reutilizamos el método de arriba para validar
    Object.assign(hardware, dto);
    return await this.hardwareRepo.save(hardware);
  }

  // Metodo para eliminar un hardware
  async remove(id: number) {
    const hardware = await this.findOne(id);
    if (!hardware.is_active) throw new BadRequestException('El hardware ya está inactivo');
    hardware.is_active = false;
    await this.hardwareRepo.save(hardware);
    return { message: `Hardware con ID ${id} ha sido desactivado exitosamente` }; 
  }

  //Metodo para instalar un hardware en un equipo
  async installHardware(id_hardware: number, id_equipo: number, description: string, serie: string, proveedor: string) {
    const hardware = await this.findOne(id_hardware);
    if(!hardware.is_active) throw new BadRequestException('No se puede instalar un hardware inactivo');

    const equipo = await this.equiposRepo.findOneBy({ id_equipo });
    if(!equipo) throw new NotFoundException(`El equipo con el id ${id_equipo} no existe `);

    const NewRegistro = this.regHardRepo.create({
      hardware: hardware,
      equipo: equipo,
      descripcion: description,
      serie: serie,
      proveedor: proveedor,
    });

    return await this.regHardRepo.save(NewRegistro);
  }
}