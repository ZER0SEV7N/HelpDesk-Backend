import { Equipos } from '@/entities/Equipos.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEquipoDTO } from '../dto/create-equipos.dto';

@Injectable()
export class CreateEquipoUseCase {
  constructor(
    @InjectRepository(Equipos)
    private readonly equiposRepo: Repository<Equipos>,
  ) {}

  async execute(dto: CreateEquipoDTO) {
    const equipo = this.equiposRepo.create(dto as Partial<Equipos>); 
    return await this.equiposRepo.save(equipo); 
  }
}