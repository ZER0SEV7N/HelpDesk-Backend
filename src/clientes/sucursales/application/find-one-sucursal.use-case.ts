import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sucursales } from '@/entities/Sucursales.entity';
import { SucursalResponseHelper } from '../helpers/sucursal-response.helper';

@Injectable()
export class FindOneSucursalUseCase {
  constructor(
    @InjectRepository(Sucursales) private readonly sucursalRepo: Repository<Sucursales>,
    private readonly responseHelper: SucursalResponseHelper,
  ) {}

  async execute(id: number) {
    const sucursal = await this.sucursalRepo.findOne({
      where: { id_sucursal: id },
      relations: ['cliente', 'areas', 'equipos', 'usuarios'],
    });
    if (!sucursal) throw new NotFoundException(`Sucursal con ID ${id} no encontrada`);
    
    return this.responseHelper.cleanResponse(sucursal);
  }
}