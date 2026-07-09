import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AreaResponseHelper } from '../helpers/area-response.helper';
import { Area } from '@/entities/Area.entity';
import { Sucursales } from '@/entities/Sucursales.entity';
import { CreateAreaDto } from '@/clientes/dto/create-area.dto';

@Injectable()
export class CreateAreaUseCase {
  constructor(
    @InjectRepository(Area) private readonly areaRepo: Repository<Area>,
    @InjectRepository(Sucursales) private readonly sucursalRepo: Repository<Sucursales>,
    private readonly responseHelper: AreaResponseHelper,
  ) {}

  async execute(dto: CreateAreaDto) {
    const sucursal = await this.sucursalRepo.findOne({
      where: { id_sucursal: dto.id_sucursal },
    });
    if (!sucursal) throw new NotFoundException(`Sucursal con ID ${dto.id_sucursal} no encontrada`);
    
    const nuevaArea = this.areaRepo.create({
      ...dto,
      sucursal: sucursal,
    });
    
    const saved = await this.areaRepo.save(nuevaArea);
    return this.responseHelper.cleanResponse(saved);
  }
}