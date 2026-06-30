// src/clientes/shared/validation.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Clientes } from '@/entities/Clientes.entity';
import { Sucursales } from '@/entities/Sucursales.entity';

@Injectable()
export class ClientesValidationService {
  constructor(
    @InjectRepository(Clientes) private readonly clientesRepo: Repository<Clientes>,
    @InjectRepository(Sucursales) private readonly sucursalesRepo: Repository<Sucursales>,
  ) {}

  async checkCliente(id: number) {
    const cliente = await this.clientesRepo.findOne({ where: { id_cliente: id } });
    if (!cliente) throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    return cliente;
  }

  async checkSucursal(id: number) {
    const sucursal = await this.sucursalesRepo.findOne({ where: { id_sucursal: id }, relations: ['cliente'] });
    if (!sucursal) throw new NotFoundException(`Sucursal con ID ${id} no encontrada`);
    return sucursal;
  }
}