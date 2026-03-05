import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Equipo, EquipoDocument } from '../schemas/equipo.schema';
import { CreateEquipoDTO } from './dto/create-equipos.dto';
import { UpdateEquipoDto } from './dto/update-equipos.dto';

@Injectable()
export class EquiposService {
  constructor(
    @InjectModel(Equipo.name) private equipoModel: Model<EquipoDocument>,
  ) {}

  async create(dto: CreateEquipoDTO) {
    const data: any = {
      tipo: dto.tipo,
      marca: dto.marca,
      numero_serie: dto.numero_serie,
      nombre_usuario: dto.nombre_usuario,
      area: dto.area,
      ultRevision: dto.ultRevision,
      revProgramada: dto.revProgramada,
    };
    if (dto.id_empresa) data.empresa = new Types.ObjectId(dto.id_empresa);
    if (dto.id_plan) data.plan = new Types.ObjectId(dto.id_plan);
    const equipo = await this.equipoModel.create(data);
    return equipo.toObject();
  }

  async findAll() {
    return this.equipoModel.find().populate('empresa plan').lean().exec();
  }

  async findOne(id: string) {
    const equipo = await this.equipoModel.findById(id).populate('empresa plan').lean().exec();
    if (!equipo) throw new NotFoundException(`Equipo con ID ${id} no encontrado`);
    return equipo;
  }

  async update(id: string, dto: UpdateEquipoDto) {
    const equipo = await this.equipoModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true })
      .lean()
      .exec();
    if (!equipo) throw new NotFoundException(`Equipo con ID ${id} no encontrado`);
    return equipo;
  }

  async remove(id: string) {
    const equipo = await this.equipoModel.findByIdAndDelete(id).exec();
    if (!equipo) throw new NotFoundException(`Equipo con ID ${id} no encontrado`);
    return equipo.toObject();
  }
}
