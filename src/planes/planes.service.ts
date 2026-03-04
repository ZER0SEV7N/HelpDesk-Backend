import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Planes } from '../entities/planes.entity';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class PlanesService {
  constructor(
    @InjectRepository(Planes)
    private readonly planesRepo: Repository<Planes>,
  ) {}

  async create(createPlanDto: CreatePlanDto) {
    const plan = this.planesRepo.create(createPlanDto);
    return this.planesRepo.save(plan);
  }

  async findAll() {
    return this.planesRepo.find({
      order: { numero_plan: 'ASC' },
    });
  }

  async findOne(id: number) {
    const plan = await this.planesRepo.findOne({ where: { id_plan: id } });
    if (!plan) {
      throw new NotFoundException(`Plan con ID ${id} no encontrado`);
    }
    return plan;
  }

  async update(id: number, updatePlanDto: UpdatePlanDto) {
    const plan = await this.findOne(id);
    Object.assign(plan, updatePlanDto);
    return this.planesRepo.save(plan);
  }

  async remove(id: number) {
    const plan = await this.findOne(id);
    return this.planesRepo.remove(plan);
  }
}
