import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Citas_Soporte } from '@/entities/Citas-Soporte.entity';
import { CitaDetailResponseDto } from '../dto/cita-detail-response-dto';

@Injectable()
export class FindOneCitaUseCase {
  constructor(
    @InjectRepository(Citas_Soporte)
    private readonly citasRepository: Repository<Citas_Soporte>,
  ) {}

  async execute(id: number): Promise<CitaDetailResponseDto> {
    const cita = await this.citasRepository.findOne({
      where: { id_cita: id },
      relations: [
        'sucursal',
        'soporte_insitu',
        'tickets',
        'tickets.trabajador.area',
      ],
    });

    if (!cita) {
      throw new NotFoundException(`La cita con ID #${id} no fue encontrada.`);
    }

    return CitaDetailResponseDto.init(cita);
  }
}
