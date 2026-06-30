import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClienteResponseHelper } from '../helpers/cliente-response.helper';
import { Clientes } from '@/entities/Clientes.entity';
import { Planes } from '@/entities/Planes.entity';
import { UpdateContractDto } from '@/clientes/dto/update-contract.dto';

@Injectable()
export class UpdateContractUseCase {
  constructor(
    @InjectRepository(Clientes) private readonly clientesRepo: Repository<Clientes>,
    @InjectRepository(Planes) private readonly planesRepo: Repository<Planes>,
    private readonly responseHelper: ClienteResponseHelper,
  ) {}

  async execute(id: number, dto: UpdateContractDto) {
    const cliente = await this.clientesRepo.findOne({ where: { id_cliente: id } });
    if (!cliente) throw new NotFoundException(`Cliente con ID ${id} no encontrado`); 

    const plan = await this.planesRepo.findOne({ where: { id_plan: dto.id_plan } }); 
    if (!plan) throw new NotFoundException(`El plan con el ID ${dto.id_plan} no existe en el sistema`); 
    cliente.id_plan = plan.id_plan;
    cliente.fecha_finalizacion_plan = new Date(dto.nuevaFechaFin);
    
    // Si viene información en cascada o renovación de límites se procesa aquí
    await this.clientesRepo.save(cliente);

    const baseResponse = this.responseHelper.cleanResponse(cliente);

    return {
      message: `Plan del cliente ${cliente.nombre_principal} actualizado a ${plan.tipo} con fecha de finalización ${dto.nuevaFechaFin}.`,
      cliente: baseResponse,
    };
  }
}