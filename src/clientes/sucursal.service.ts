//helpdesk-app/src/clientes/sucursal.service.ts
//Modulo de servicio para manejar las funcionalidades relacionadas con las sucursales de los clientes
//Importaciones necesarias:
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sucursales } from '@/entities/Sucursales.entity';
import { CreateSucursalDto } from './dto/create-sucursal.dto';
import { Clientes } from '@/entities/Clientes.entity';

@Injectable()
export class SucursalService {
  constructor(
    @InjectRepository(Sucursales)
    private sucursalRepo: Repository<Sucursales>,
    @InjectRepository(Clientes)
    private clientesRepo: Repository<Clientes>,
  ) {}

  private cleanResponse(sucursal: Sucursales) {
    const {
      created_at: _created,
      updated_at: _updated,
      ...sucursalLimpia
    } = sucursal as any;
    if (sucursal.cliente) {
      const {
        created_at: _cli_created,
        updated_at: _cli_updated,
        fecha_registro: _cli_fecha,
        ...clienteLimpio
      } = sucursal.cliente as any;
      sucursalLimpia.cliente = clienteLimpio;
    }
    if (sucursal.areas) {
      sucursalLimpia.areas = sucursal.areas.map((area) => {
        const {
          created_at: _area_created,
          updated_at: _area_updated,
          ...areaLimpia
        } = area as any;
        return areaLimpia;
      });
    }
    if (sucursal.equipos) {
      sucursalLimpia.equipos = sucursal.equipos.map((equipo) => {
        const {
          created_at: _eq_created,
          updated_at: _eq_updated,
          ...equipoLimpio
        } = equipo as any;
        return equipoLimpio;
      });
    }

    // 5. Limpiar Usuarios 🚨 (CRÍTICO: Remover contraseña)
    if (sucursal.usuarios) {
      sucursalLimpia.usuarios = sucursal.usuarios.map((usuario) => {
        const {
          contraseña: _clave,
          created_at: _usr_created,
          updated_at: _usr_updated,
          ...usuarioLimpio
        } = usuario as any;
        return usuarioLimpio;
      });
    }

    return sucursalLimpia;
  }
  //Crear una nueva sucursal para un cliente existente
  async create(dto: CreateSucursalDto) {
    //Validar que el cliente exista
    const cliente = await this.clientExists(dto.id_cliente);

    //Si la validacion es exitosa, se crea la nueva sucursal
    const nuevaSucursal = this.sucursalRepo.create({
      ...dto,
      cliente: cliente,
    });
    const saved = await this.sucursalRepo.save(nuevaSucursal);
    return this.cleanResponse(saved);
  }

  //Listar todas las sucursales de todas las empresas
  async findAll() {
    const sucursales = await this.sucursalRepo.find({
      relations: ['cliente', 'areas'],
    });
    return sucursales.map((sucursal) => this.cleanResponse(sucursal));
  }

  //Encontrar una sucursal por ID
  async findOne(id: number) {
    const sucursal = await this.sucursalRepo.findOne({
      where: { id_sucursal: id },
      relations: ['cliente', 'areas', 'equipos', 'usuarios'],
    });
    if (!sucursal)
      throw new NotFoundException(`Sucursal con ID ${id} no encontrada`);

    return this.cleanResponse(sucursal);
  }

  //Listar las sucursales de un cliente especifico
  async findByCliente(id_cliente: number) {
    await this.clientExists(id_cliente);
    const sucursales = await this.sucursalRepo.find({
      where: { id_cliente: id_cliente },
      relations: ['areas'],
    });
    return sucursales.map((sucursal) => this.cleanResponse(sucursal));
  }

  //Actualizar los datos de una sucursal
  async update(id: number, dto: Partial<CreateSucursalDto>) {
    const sucursal = await this.sucursalExists(id);
    if (dto.id_cliente && dto.id_cliente !== sucursal.id_cliente) {
      throw new BadRequestException(
        'Operación no permitida: No se puede transferir una sucursal a otra empresa.',
      );
    }

    Object.assign(sucursal, dto);
    const updated = await this.sucursalRepo.save(sucursal);
    return this.cleanResponse(updated);
  }

  //Desactivar una sucursal (no se eliminará de la base de datos por integridad referencial, solo se marcará como inactiva)
  async deactivate(id: number) {
    const sucursal = await this.sucursalExists(id);
    if (!sucursal.is_active)
      throw new BadRequestException('La sucursal ya se encuentra inactiva');
    sucursal.is_active = false;
    await this.sucursalRepo.save(sucursal);
    return {
      message: `La sucursal ${sucursal.nombre_sucursal} ha sido desactivada.`,
    };
  }

  //Reactivar una sucursal
  async reactivate(id: number) {
    const sucursal = await this.sucursalExists(id);
    if (sucursal.is_active)
      throw new BadRequestException('La sucursal ya se encuentra activa');
    sucursal.is_active = true;
    await this.sucursalRepo.save(sucursal);
    return {
      message: `La sucursal ${sucursal.nombre_sucursal} ha sido reactivada.`,
    };
  }

  private async clientExists(id_cliente: number) {
    const cliente = await this.clientesRepo.findOne({ where: { id_cliente } });
    if (!cliente)
      throw new NotFoundException(`Cliente con ID ${id_cliente} no encontrado`);
    return cliente;
  }

  private async sucursalExists(id_sucursal: number) {
    const sucursal = await this.sucursalRepo.findOne({
      where: { id_sucursal },
    });
    if (!sucursal)
      throw new NotFoundException(
        `Sucursal con ID ${id_sucursal} no encontrada`,
      );
    return sucursal;
  }
}
