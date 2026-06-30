import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AreaResponseHelper } from '../helpers/area-response.helper';
import { Area } from '@/entities/Area.entity';


@Injectable()
export class FindOneAreaUseCase {
  constructor(
    @InjectRepository(Area) private readonly areaRepo: Repository<Area>,
    private readonly responseHelper: AreaResponseHelper,
  ) {}

  async execute(id: number) {
    const area = await this.areaRepo.findOne({
      where: { id_area: id },
      relations: ['sucursal', 'sucursal.cliente'],
    });
    if (!area) throw new NotFoundException(`Area con ID ${id} no encontrada`);
    
    return this.responseHelper.cleanResponse(area);
  }
}