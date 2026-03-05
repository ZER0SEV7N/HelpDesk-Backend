import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Plan, PlanDocument } from '../schemas/plan.schema';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class PlanesService {
  constructor(
    @InjectModel(Plan.name) private planModel: Model<PlanDocument>,
  ) {}

  async create(createPlanDto: CreatePlanDto) {
    const plan = await this.planModel.create(createPlanDto);
    return plan.toObject();
  }

  async findAll() {
    return this.planModel.find().sort({ numero_plan: 1 }).lean().exec();
  }

  async findOne(id: string) {
    const plan = await this.planModel.findById(id).lean().exec();
    if (!plan) {
      throw new NotFoundException(`Plan con ID ${id} no encontrado`);
    }
    return plan;
  }

  async update(id: string, updatePlanDto: UpdatePlanDto) {
    const plan = await this.planModel
      .findByIdAndUpdate(id, { $set: updatePlanDto }, { new: true })
      .lean()
      .exec();
    if (!plan) throw new NotFoundException(`Plan con ID ${id} no encontrado`);
    return plan;
  }

  async remove(id: string) {
    const plan = await this.planModel.findByIdAndDelete(id).exec();
    if (!plan) throw new NotFoundException(`Plan con ID ${id} no encontrado`);
    return plan.toObject();
  }
}
