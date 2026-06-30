import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sucursales } from '@/entities/Sucursales.entity';

@Injectable()
export class DeactivateSucursalUseCase {
  constructor(
    @InjectRepository(Sucursales) private readonly sucursalRepo: Repository<Sucursales>
  ) {}

  async execute(id: number) {
    const sucursal = await this.sucursalRepo.findOne({ where: { id_sucursal: id } });
    if (!sucursal) throw new NotFoundException(`Sucursal con ID ${id} no encontrada`);
    if (!sucursal.is_active) throw new BadRequestException('La sucursal ya se encuentra inactiva');

    sucursal.is_active = false;
    await this.sucursalRepo.save(sucursal);
    return { message: `La sucursal ${sucursal.nombre_sucursal} ha sido desactivada.` };
  }
}