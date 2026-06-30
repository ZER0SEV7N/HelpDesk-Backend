import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AreaResponseHelper } from '../helpers/area-response.helper';
import { Area } from '@/entities/Area.entity';
import { CreateAreaDto } from '@/clientes/dto/create-area.dto';

@Injectable()
export class UpdateAreaUseCase {
  constructor(
    @InjectRepository(Area) private readonly areaRepo: Repository<Area>,
    private readonly responseHelper: AreaResponseHelper,
  ) {}

  async execute(id: number, dto: Partial<CreateAreaDto>) {
    const area = await this.areaRepo.findOne({ where: { id_area: id } });
    if (!area) throw new NotFoundException(`Area con ID ${id} no encontrada`);

    if (dto.id_sucursal && dto.id_sucursal !== area.id_sucursal) {
      throw new BadRequestException('Operación no permitida: No se puede transferir un área a otra sucursal.');
    }
    
    Object.assign(area, dto);
    const updated = await this.areaRepo.save(area);
    return this.responseHelper.cleanResponse(updated);
  }
}