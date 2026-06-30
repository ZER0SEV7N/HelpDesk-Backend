import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClienteResponseHelper } from '../helpers/cliente-response.helper';
import { Clientes } from '@/entities/Clientes.entity';

@Injectable()
export class FindAllClientesUseCase {
  constructor(
    @InjectRepository(Clientes) private readonly clientesRepo: Repository<Clientes>,
    private readonly responseHelper: ClienteResponseHelper,
  ) {}

  async execute() {
    const clientes = await this.clientesRepo.find({
      relations: ['sucursales', 'plan'],
    });
    return clientes.map(cliente => this.responseHelper.cleanResponse(cliente));
  }
}