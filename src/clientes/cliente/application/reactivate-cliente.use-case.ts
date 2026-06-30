import { Area } from '@/entities/Area.entity';
import { Clientes } from '@/entities/Clientes.entity';
import { Equipos } from '@/entities/Equipos.entity';
import { Sucursales } from '@/entities/Sucursales.entity';
import { Usuario } from '@/entities/Usuario.entity';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

@Injectable()
export class ReactivateClienteUseCase {
  constructor(
    @InjectRepository(Clientes) private readonly clientesRepo: Repository<Clientes>,
    @InjectRepository(Sucursales) private readonly sucursalesRepo: Repository<Sucursales>,
    @InjectRepository(Area) private readonly areaRepo: Repository<Area>,
    @InjectRepository(Usuario) private readonly usuariosRepo: Repository<Usuario>,
    @InjectRepository(Equipos) private readonly equiposRepo: Repository<Equipos>,
  ) {}

  async execute(id: number) {
    const cliente = await this.clientesRepo.findOne({ where: { id_cliente: id } }); 
    if (!cliente) throw new NotFoundException(`Cliente con ID ${id} no encontrado`); 
    if (cliente.is_active) throw new BadRequestException('El cliente ya se encuentra activo');

    cliente.is_active = true; 
    await this.clientesRepo.save(cliente); 

    const sucursales = await this.sucursalesRepo.find({ where: { id_cliente: id }, select: ['id_sucursal'] }); 
    if (sucursales.length > 0) { 
      const sucursalIds = sucursales.map(s => s.id_sucursal); 

      await this.sucursalesRepo.update(sucursalIds, { is_active: true }); 
      await this.areaRepo.update({ id_sucursal: In(sucursalIds) }, { is_active: true }); 
      await this.usuariosRepo.update({ id_cliente: id }, { is_active: true });
      await this.equiposRepo.update({ id_cliente: id }, { is_active: true }); 
    }

    return { message: `Cliente ${cliente.nombre_principal} y sus sucursales han sido reactivados` };
  }
}