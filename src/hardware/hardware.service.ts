//src/hardware/hardware.service.ts
//Servicio para la gestion de hardware
//Importaciones necesarias:
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hardware } from '../entities/Hardware.entity';
import { CreateHardwareDto } from './dto/create-hardware.dto';
import { UpdateHardwareDto } from './dto/update-hardware.dto';

//Definicion del servicio HardwareService
@Injectable()
export class HardwareService {
    constructor(
        @InjectRepository(Hardware)
        private hardwareRepo: Repository<Hardware>,
    ) {}

    //Crear un nuevo hardware
    async create(createHardwareDto: CreateHardwareDto) {
        const nuevoHardware = this.hardwareRepo.create(createHardwareDto);
        return this.hardwareRepo.save(nuevoHardware);
    }

    //Listar todos los hardwares
    async findAll() {
        return this.hardwareRepo.find({
            relations: ['rh'], // Incluir la relacion con RegistroHardware
        });
    }

    //Buscar un hardware por ID
    async findOne(id: number) {
        const hardware = await this.hardwareRepo.findOne({
            where: { id_hardware: id },
            relations: ['rh'],
        });

        if (!hardware) {
            throw new NotFoundException(`Hardware con ID ${id} no encontrado`);
        }

        return hardware;
    }

    //Actualizar un hardware
    async update(id: number, updateHardwareDto: UpdateHardwareDto) {
        const hardware = await this.findOne(id);
        Object.assign(hardware, updateHardwareDto);
        return this.hardwareRepo.save(hardware);
    }

    //Eliminar un hardware
    async remove(id: number) {
        const hardware = await this.findOne(id);
        return this.hardwareRepo.remove(hardware);
    }

    //Buscar hardware por tipo
    async findByTipo(tipo: string) {
        return this.hardwareRepo.find({
            where: { tipo_equipo: tipo },
        });
    }

    //Buscar hardware por marca
    async findByMarca(marca: string) {
        return this.hardwareRepo.find({
            where: { marca: marca },
        });
    }
}
