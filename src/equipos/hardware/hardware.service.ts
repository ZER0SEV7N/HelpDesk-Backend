import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Hardware, HardwareDocument } from '../../schemas/hardware.schema';
import { CreateHardwareDto } from './dto/create-hardware.dto';
import { UpdateHardwareDto } from './dto/update-hardware.dto';

@Injectable()
export class HardwareService {
  constructor(
    @InjectModel(Hardware.name) private hardwareModel: Model<HardwareDocument>,
  ) {}

  async create(dto: CreateHardwareDto) {
    const hardware = await this.hardwareModel.create(dto);
    return hardware.toObject();
  }

  async findAll() {
    return this.hardwareModel.find().lean().exec();
  }

  async findOne(id: string) {
    const hardware = await this.hardwareModel.findById(id).lean().exec();
    if (!hardware) {
      throw new NotFoundException(`Hardware con ID ${id} no encontrado`);
    }
    return hardware;
  }

  async update(id: string, dto: UpdateHardwareDto) {
    const hardware = await this.hardwareModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true })
      .lean()
      .exec();
    if (!hardware) throw new NotFoundException(`Hardware con ID ${id} no encontrado`);
    return hardware;
  }

  async remove(id: string) {
    const hardware = await this.hardwareModel.findByIdAndDelete(id).exec();
    if (!hardware) throw new NotFoundException(`Hardware con ID ${id} no encontrado`);
    return hardware.toObject();
  }

  async findByTipo(tipo: string) {
    return this.hardwareModel.find({ tipo_equipo: tipo }).lean().exec();
  }

  async findByMarca(marca: string) {
    return this.hardwareModel.find({ marca }).lean().exec();
  }
}
