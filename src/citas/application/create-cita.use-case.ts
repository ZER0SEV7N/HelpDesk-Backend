import { Citas } from '@/entities/Citas.entity';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCitaDto } from '../dto/create-cita-dto';

@Injectable()
export class CreateCitaUseCase {
  constructor(
    @InjectRepository(Citas)
    private readonly citasRepository: Repository<Citas>,
  ) {}

  async execute(citaData: CreateCitaDto): Promise<Citas> {
    const cita = this.citasRepository.create(citaData);
    return await this.citasRepository.save(cita);
  }
}
