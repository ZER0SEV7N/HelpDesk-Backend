import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sucursales } from '@/entities/Sucursales.entity';
import { SucursalResponseHelper } from '../helpers/sucursal-response.helper';
import { CreateSucursalDto } from '@/clientes/dto/create-sucursal.dto';

@Injectable()
export class UpdateSucursalUseCase {
  constructor(
    @InjectRepository(Sucursales) private readonly sucursalRepo: Repository<Sucursales>,
    private readonly responseHelper: SucursalResponseHelper,
  ) {}

  async execute(id: number, dto: Partial<CreateSucursalDto>) {
    const sucursal = await this.sucursalRepo.findOne({ where: { id_sucursal: id } });
    if (!sucursal) throw new NotFoundException(`Sucursal con ID ${id} no encontrada`);

    if (dto.id_cliente && dto.id_cliente !== sucursal.id_cliente) {
      throw new BadRequestException('Operación no permitida: No se puede transferir una sucursal a otra empresa.');
    }
    
    Object.assign(sucursal, dto);
    const updated = await this.sucursalRepo.save(sucursal);
    return this.responseHelper.cleanResponse(updated);
  }
}