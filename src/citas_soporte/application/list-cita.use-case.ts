import { Citas_Soporte } from '@/entities/Citas-Soporte.entity';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CitaResponseDto } from '../dto/cita-response.dto';

@Injectable()
export class ListCitaUseCase {
  constructor(
    @InjectRepository(Citas_Soporte)
    private readonly citasRepository: Repository<Citas_Soporte>,
  ) {}

  async execute(): Promise<CitaResponseDto[]> {
    const citas = await this.citasRepository.find({
      relations: ['tickets', 'sucursal', 'soporte_insitu'],
    });
    return CitaResponseDto.initList(citas);
  }
}
