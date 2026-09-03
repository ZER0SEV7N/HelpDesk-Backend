import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClienteResponseHelper } from '../helpers/cliente-response.helper';
import { Clientes } from '@/entities/Clientes.entity';
import { ClienteFilterParamDTO } from '@/clientes/dto/cliente-filter-param.dto';

@Injectable()
export class FindAllClientesUseCase {
  constructor(
    @InjectRepository(Clientes)
    private readonly clientesRepo: Repository<Clientes>,
    private readonly responseHelper: ClienteResponseHelper,
  ) {}

  async execute(params: ClienteFilterParamDTO) {
    // Construir el objeto where
    const where: Record<string, any> = {};

    if (params.tipo_cliente !== undefined)
      where.tipo_cliente = params.tipo_cliente;
    if (params.estado !== undefined) where.is_active = params.estado;

    const clientes = await this.clientesRepo.find({
      where,
      relations: ['sucursales', 'plan'],
    });
    return clientes.map((cliente) =>
      this.responseHelper.cleanResponse(cliente),
    );
  }
}
