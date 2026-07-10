import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FindOneEquipoUseCase } from './find-one-equipo.use-case';
import { Equipos } from '@/entities/Equipos.entity';
import { JwtPayload } from '@/common/guards/jwt-auth.guard';

@Injectable()
export class AssignEquipoUseCase {
  constructor(
    @InjectRepository(Equipos)
    private readonly equiposRepo: Repository<Equipos>,
    private readonly findOneUseCase: FindOneEquipoUseCase,
  ) {}

  async execute(
    id: number,
    id_trabajador: number,
    area: string,
    id_sucursal: number | undefined,
    userToken: JwtPayload,
  ) {
    // Validar que el equipo exista y que el usuario tenga permisos para asignarlo
    const equipo = await this.findOneUseCase.execute(id, userToken);
    // Validar que el equipo no esté asignado a otro trabajador
    if (equipo.id_trabajador) {
      throw new Error(
        `El equipo ya está asignado a otro trabajador (ID: ${equipo.id_trabajador})`,
      );
    }
    // Asignar el equipo al trabajador y actualizar el área
    equipo.id_trabajador = id_trabajador; 
    equipo.area = area;

    // Si se proporciona un id_sucursal, actualizarlo también
    if (id_sucursal) equipo.id_sucursal = id_sucursal; 

    const equipoActualizado = await this.equiposRepo.save(equipo); 
    
    return {
      message: `Equipo asignado exitosamente en el área de ${area}`,
      equipo: equipoActualizado,
    }; 
  }
}