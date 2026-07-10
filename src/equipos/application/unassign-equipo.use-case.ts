import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FindOneEquipoUseCase } from './find-one-equipo.use-case';
import { Equipos } from '@/entities/Equipos.entity';
import { JwtPayload } from '@/common/guards/jwt-auth.guard';

@Injectable()
export class UnassignEquipoUseCase {
  constructor(
    @InjectRepository(Equipos)
    private readonly equiposRepo: Repository<Equipos>,
    private readonly findOneUseCase: FindOneEquipoUseCase,
  ) {}

  async execute(id: number, userToken: JwtPayload) {
    const equipo = await this.findOneUseCase.execute(id, userToken); 
    
    equipo.nombre_usuario = 'Sin asignar'; 
    equipo.area = 'Sin asignar'; 
    
    const equipoActualizado = await this.equiposRepo.save(equipo); 
    
    return {
      message: `Equipo liberado exitosamente`,
      equipo: equipoActualizado,
    }; 
  }
}