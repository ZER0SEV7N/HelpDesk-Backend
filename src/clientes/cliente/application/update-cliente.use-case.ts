import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClienteResponseHelper } from '../helpers/cliente-response.helper';
import { Clientes } from '@/entities/Clientes.entity';
import { CreateClienteDto } from '@/clientes/dto/create-cliente.dto';

@Injectable()
export class UpdateClienteUseCase {
  constructor(
    @InjectRepository(Clientes) private readonly clientesRepo: Repository<Clientes>,
    private readonly responseHelper: ClienteResponseHelper,
  ) {}

  async execute(id: number, dto: Partial<CreateClienteDto>) {
    const cliente = await this.clientesRepo.findOne({ where: { id_cliente: id } });
    if (!cliente) throw new NotFoundException(`Cliente con ID ${id} no encontrado`);

    if (dto.numero_documento && dto.numero_documento !== cliente.numero_documento) {
      const exists = await this.clientesRepo.findOne({ where: { numero_documento: dto.numero_documento } });
      if (exists) throw new ConflictException(`Ya existe un cliente con ese documento ${dto.numero_documento}`);
    }

    Object.assign(cliente, dto);
    const updated = await this.clientesRepo.save(cliente);
    return this.responseHelper.cleanResponse(updated);
  }
}