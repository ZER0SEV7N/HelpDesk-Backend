import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClienteResponseHelper } from '../helpers/cliente-response.helper';
import { Clientes } from '@/entities/Clientes.entity';

@Injectable()
export class FindOneClienteUseCase {
  constructor(
    @InjectRepository(Clientes) private readonly clientesRepo: Repository<Clientes>,
    private readonly responseHelper: ClienteResponseHelper,
  ) {}

  async execute(id: number) {
    const cliente = await this.clientesRepo.findOne({
      where: { id_cliente: id },
      relations: ['sucursales', 'equipos', 'plan'],
    });
    if (!cliente) throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    return this.responseHelper.cleanResponse(cliente);
  }
}