import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSucursalDto } from '../../dto/create-sucursal.dto';
import { FindOneClienteUseCase } from './find-one-cliente.use-case';
import { Clientes } from '@/entities/Clientes.entity';
import { Planes } from '@/entities/Planes.entity';
import { Sucursales } from '@/entities/Sucursales.entity';
import { CreateClienteDto } from '@/clientes/dto/create-cliente.dto';

@Injectable()
export class CreateClienteUseCase {
  constructor(
    @InjectRepository(Clientes) private readonly clientesRepo: Repository<Clientes>,
    @InjectRepository(Planes) private readonly planesRepo: Repository<Planes>,
    @InjectRepository(Sucursales) private readonly sucursalesRepo: Repository<Sucursales>,
    private readonly findOneClienteUseCase: FindOneClienteUseCase,
  ) {}

  async execute(dto: CreateClienteDto, suc: Partial<CreateSucursalDto>) {
    const exists = await this.clientesRepo.findOne({ where: { numero_documento: dto.numero_documento } });
    if (exists) throw new ConflictException(`Ya existe un cliente con ese documento ${dto.numero_documento}`);

    const planIdAsignar = dto.id_plan ? dto.id_plan : 1;
    const planExists = await this.planesRepo.findOne({ where: { id_plan: planIdAsignar } });
    if (!planExists) throw new NotFoundException(`El plan con el ID ${planIdAsignar} no existe en el sistema`);

    let fechaInicio = dto.fecha_inicio_plan ? new Date(dto.fecha_inicio_plan) : new Date();
    let fechaFinalizacion: Date;

    if (dto.fecha_finalizacion_plan) {
      fechaFinalizacion = new Date(dto.fecha_finalizacion_plan);
      if (isNaN(fechaFinalizacion.getTime())) throw new BadRequestException('La fecha de finalización enviada no es un formato válido.');
    } else {
      fechaFinalizacion = new Date(fechaInicio);
      fechaFinalizacion.setFullYear(fechaFinalizacion.getFullYear() + 1);
    }

    const nuevoCliente = this.clientesRepo.create({
      ...dto,
      id_plan: planExists.id_plan,
      fecha_inicio_plan: fechaInicio,
      fecha_finalizacion_plan: fechaFinalizacion,
      costo_negociado: dto.costo_negociado !== undefined ? dto.costo_negociado : planExists.precio,
      limite_equipos_contratado: dto.limite_equipos_contratado !== undefined ? dto.limite_equipos_contratado : planExists.limite_equipos,
      is_active: true
    });

    const clienteGuardado = await this.clientesRepo.save(nuevoCliente);

    if (suc.id_cliente && suc.id_cliente !== clienteGuardado.id_cliente) {
      throw new BadRequestException('El ID del cliente en el DTO de sucursal no coincide con el cliente creado');
    }

    const sucursalPrincipal = this.sucursalesRepo.create({
      nombre_sucursal: suc.nombre_sucursal || 'Sucursal Principal',
      encargado: suc.encargado || 'Por Asignar',
      telefono: suc.telefono || 'sin especificar',
      correo: suc.correo || 'sin especificar@example.com',
      direccion: suc.direccion || 'sin especificar',
      cliente: clienteGuardado
    });

    await this.sucursalesRepo.save(sucursalPrincipal);
    return this.findOneClienteUseCase.execute(clienteGuardado.id_cliente);
  }
}