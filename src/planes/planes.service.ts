//helpdesk-backend/src/planes/planes.service.ts
//Servicio para manejar la logica de negocio relacionada con los planes.
//Incluye metodos para crear, obtener, actualizar y eliminar planes.
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Planes } from '../entities/Planes.entity';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { Clientes } from 'src/entities/Clientes.entity';

//Servicio Planes
@Injectable()
export class PlanesService {
  constructor(
    //Inyectamos el repositorio de Planes para interactuar con la base de datos
    @InjectRepository(Planes)
    private readonly planesRepo: Repository<Planes>,

  ) {}

  /*========================================
   * Metodos para crear un nuevo plan,
    * Rol Encargado: ADMIN
    * POST: /planes
   ========================================*/
  async create(createPlanDto: CreatePlanDto) {
    const plan = this.planesRepo.create(createPlanDto);
    return this.planesRepo.save(plan);
  }

  /*========================================
    * Metodos para obtener todos los planes,
    * Rol Encargado: ADMIN.
    * GET: /planes
   ========================================*/
  async findAll(soloActivos: boolean = true) {
    const whereCondition = soloActivos ? { is_active: true } : {};
    return this.planesRepo.find({
      where: whereCondition,
      order: { numero_plan: 'ASC' },
    });
  }

  /*========================================
    * Metodos para obtener un plan por su ID,
    * Rol Encargado: ADMIN.
    * GET: /planes/:id
   ========================================*/
  async findOne(id: number) {
    const plan = await this.planesRepo.findOne({ where: { id_plan: id } });
    if (!plan) {
      throw new NotFoundException(`Plan con ID ${id} no existe`);
    }
    return plan;
  }

  /*========================================
    * Metodos para actualizar un plan por su ID,
    * Rol Encargado: ADMIN.
    * PATCH: /planes/:id
   ========================================*/
  async update(id: number, updatePlanDto: UpdatePlanDto) {
    const plan = await this.findOne(id);
    Object.assign(plan, updatePlanDto);
    return this.planesRepo.save(plan);
  }

  /*========================================
    * Metodos para eliminar un plan por su ID,
    * Rol Encargado: ADMIN.
    * DELETE: /planes/:id
   ========================================*/
  async remove(id: number) {
    const plan = await this.findOne(id);
    return this.planesRepo.remove(plan);
  }

  //SOFT DELETE: Archivar un plan para que ya no esté disponible para nuevos clientes, pero sin eliminarlo de la base de datos.
  async deactivate(id: number) {
    const plan = await this.findOne(id);
    
    if (!plan.is_active) throw new BadRequestException('Este plan ya se encuentra inactivo');

    //No necesitamos bloquearlo si hay clientes, porque es un Soft Delete.
    //Los clientes antiguos seguirán teniendo el plan asignado, pero ya no se venderá a nuevos.
    plan.is_active = false;
    await this.planesRepo.save(plan);

    return { message: `El ${plan.tipo} ha sido archivado (Soft Delete) exitosamente.` };
  }

  //REACTIVAR: Volver a poner el plan a la venta
  async activate(id: number) {
    const plan = await this.findOne(id);
    
    if (plan.is_active) throw new BadRequestException('Este plan ya se encuentra activo');

    plan.is_active = true;
    await this.planesRepo.save(plan);

    return { message: `El ${plan.tipo} ha sido reactivado y está disponible nuevamente.` };
  }
}
