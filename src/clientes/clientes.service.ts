import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Empresa, EmpresaDocument } from '../schemas/empresa.schema';
import { CreateEmpresaDto } from './dto/create-empresa.dto';

@Injectable()
export class ClientesService {
  constructor(
    @InjectModel(Empresa.name) private empresaModel: Model<EmpresaDocument>,
  ) {}

  async create(dto: CreateEmpresaDto) {
    const empresa = await this.empresaModel.create(dto);
    return empresa.toObject();
  }

  async findAll() {
    return this.empresaModel.find().lean().exec();
  }
}
