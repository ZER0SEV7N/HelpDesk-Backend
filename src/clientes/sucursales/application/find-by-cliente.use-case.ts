import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sucursales } from '@/entities/Sucursales.entity';
import { Clientes } from '@/entities/Clientes.entity';
import { SucursalResponseHelper } from '../helpers/sucursal-response.helper';

@Injectable()
export class FindByClienteUseCase {
  constructor(
    @InjectRepository(Sucursales) private readonly sucursalRepo: Repository<Sucursales>,
    @InjectRepository(Clientes) private readonly clientesRepo: Repository<Clientes>,
    private readonly responseHelper: SucursalResponseHelper,
  ) {}

  async execute(id_cliente: number) {
    const cliente = await this.clientesRepo.findOne({ where: { id_cliente } });
    if (!cliente) throw new NotFoundException(`Cliente con ID ${id_cliente} no encontrado`);

    const sucursales = await this.sucursalRepo.find({
      where: { id_cliente: id_cliente },
      relations: ['areas'],
    });
    return sucursales.map(sucursal => this.responseHelper.cleanResponse(sucursal));
  }
}