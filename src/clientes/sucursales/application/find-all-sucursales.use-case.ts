import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SucursalResponseHelper } from '../helpers/sucursal-response.helper';
import { Sucursales } from '@/entities/Sucursales.entity';

@Injectable()
export class FindAllSucursalesUseCase {
  constructor(
    @InjectRepository(Sucursales) private readonly sucursalRepo: Repository<Sucursales>,
    private readonly responseHelper: SucursalResponseHelper,
  ) {}

  async execute() {
    const sucursales = await this.sucursalRepo.find({
      relations: ['cliente', 'areas'],
    });
    return sucursales.map(sucursal => this.responseHelper.cleanResponse(sucursal));
  }
}