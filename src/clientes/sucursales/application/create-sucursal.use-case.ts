import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SucursalResponseHelper } from '../helpers/sucursal-response.helper';
import { Sucursales } from '@/entities/Sucursales.entity';
import { Clientes } from '@/entities/Clientes.entity';
import { CreateSucursalDto } from '@/clientes/dto/create-sucursal.dto';

@Injectable()
export class CreateSucursalUseCase {
  constructor(
    @InjectRepository(Sucursales) private readonly sucursalRepo: Repository<Sucursales>,
    @InjectRepository(Clientes) private readonly clientesRepo: Repository<Clientes>,
    private readonly responseHelper: SucursalResponseHelper,
  ) {}

  async execute(dto: CreateSucursalDto) {
    const cliente = await this.clientesRepo.findOne({ where: { id_cliente: dto.id_cliente } });
    if (!cliente) throw new NotFoundException(`Cliente con ID ${dto.id_cliente} no encontrado`);

    const nuevaSucursal = this.sucursalRepo.create({
      ...dto,
      cliente: cliente,
    });

    const saved = await this.sucursalRepo.save(nuevaSucursal);
    return this.responseHelper.cleanResponse(saved);
  }
}