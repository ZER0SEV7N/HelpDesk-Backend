import { Equipos } from '@/entities/Equipos.entity';
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FindOneEquipoUseCase } from './find-one-equipo.use-case';
import { JwtPayload } from '@/common/guards/jwt-auth.guard';

@Injectable()
export class RemoveEquipoUseCase {
  constructor(
    @InjectRepository(Equipos)
    private readonly equiposRepo: Repository<Equipos>,
    private readonly findOneUseCase: FindOneEquipoUseCase,
  ) {}

  async execute(id: number, userToken: JwtPayload) {
    const equipo = await this.findOneUseCase.execute(id, userToken);
    
    if (!equipo.is_active) {
      throw new BadRequestException('El equipo ya está inactivo');
    }

    equipo.is_active = false;
    await this.equiposRepo.save(equipo);
    
    return {
      message: `Equipo con id ${id} dado de baja correctamente del sistema`,
    }; 
  }
}