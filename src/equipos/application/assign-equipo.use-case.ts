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
    nombre_usuario: string,
    area: string,
    id_sucursal: number | undefined,
    userToken: JwtPayload,
  ) {
    const equipo = await this.findOneUseCase.execute(id, userToken); 
    
    equipo.nombre_usuario = nombre_usuario; 
    equipo.area = area; 

    if (id_sucursal) equipo.id_sucursal = id_sucursal; 

    const equipoActualizado = await this.equiposRepo.save(equipo); 
    
    return {
      message: `Equipo asignado exitosamente a ${nombre_usuario} en el área de ${area}`,
      equipo: equipoActualizado,
    }; 
  }
}