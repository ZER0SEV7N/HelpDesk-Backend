import { Area } from '@/entities/Area.entity';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';


@Injectable()
export class ReactivateAreaUseCase {
  constructor(
    @InjectRepository(Area) private readonly areaRepo: Repository<Area>
  ) {}

  async execute(id: number) {
    const area = await this.areaRepo.findOne({ where: { id_area: id } });
    if (!area) throw new NotFoundException(`Area con ID ${id} no encontrada`);
    if (area.is_active) throw new BadRequestException('El área ya se encuentra activa');

    area.is_active = true;
    await this.areaRepo.save(area);
    return { message: `El área ${area.nombre_area} ha sido activada.` };
  }
}