//Servicio para la gestion de hardware
//Importaciones necesarias:
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hardware } from '../entities/hardware.entity';
import { CreateHardwareDto } from './dto/create-hardware.dto';
import { RegistroHardware } from '../entities/RegistroHardware.entity';
import { UpdateHardwareDto } from './dto/update-hardware.dto';

@Injectable()
export class HardwareService {
  create(createHardwareDto: CreateHardwareDto) {
    return 'This action adds a new hardware';
  }

  findAll() {
    return `This action returns all hardware`;
  }

  findOne(id: number) {
    return `This action returns a #${id} hardware`;
  }

  update(id: number, updateHardwareDto: UpdateHardwareDto) {
    return `This action updates a #${id} hardware`;
  }

  remove(id: number) {
    return `This action removes a #${id} hardware`;
  }
}
