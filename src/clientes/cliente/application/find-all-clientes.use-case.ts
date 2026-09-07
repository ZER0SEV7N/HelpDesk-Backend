import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { ClienteResponseHelper } from '../helpers/cliente-response.helper';
import { Clientes } from '@/entities/Clientes.entity';
import { FilterClienteDto } from '@/clientes/dto/filter-cliente.dto';

@Injectable()
export class FindAllClientesUseCase {
  constructor(
    @InjectRepository(Clientes)
    private readonly clientesRepo: Repository<Clientes>,
    private readonly responseHelper: ClienteResponseHelper,
  ) {}

  async execute(filters: FilterClienteDto = {} as FilterClienteDto) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const skip = (page - 1) * limit;

    const query = this.clientesRepo
      .createQueryBuilder('cliente')
      .leftJoinAndSelect('cliente.sucursales', 'sucursales')
      .leftJoinAndSelect('cliente.plan', 'plan')
      .skip(skip)
      .take(limit);

    if (filters.search) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('LOWER(cliente.nombre_principal) LIKE LOWER(:search)', {
            search: `%${filters.search}%`,
          })
            .orWhere('LOWER(cliente.correo) LIKE LOWER(:search)', {
              search: `%${filters.search}%`,
            })
            .orWhere('LOWER(cliente.numero_documento) LIKE LOWER(:search)', {
              search: `%${filters.search}%`,
            });
        }),
      );
    }
    if (filters.tipo_cliente)
      query.andWhere('cliente.tipo_cliente = :tipoCliente', {
        tipoCliente: filters.tipo_cliente,
      });
    if (filters.is_active !== undefined)
      query.andWhere('cliente.is_active = :isActive', {
        isActive: filters.is_active,
      });

    if (filters.id_plan) {
      query.andWhere('cliente.id_plan = :idPlan', {
        idPlan: Number(filters.id_plan),
      });
    }
    
    const [clientes, total] = await query.getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      data: clientes.map((cliente) =>
        this.responseHelper.cleanResponse(cliente),
      ),
      total,
      page,
      limit,
      totalPages,
    };
  }
}
