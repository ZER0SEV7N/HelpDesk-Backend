import { Equipos } from '@/entities/Equipos.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FindOneEquipoUseCase } from './find-one-equipo.use-case';
import { UpdateEquipoDto } from '../dto/update-equipos.dto';
import { JwtPayload } from '@/common/guards/jwt-auth.guard';

@Injectable()
export class UpdateEquipoUseCase {
  constructor(
    @InjectRepository(Equipos)
    private readonly equiposRepo: Repository<Equipos>,
    private readonly findOneUseCase: FindOneEquipoUseCase,
  ) {}

  async execute(id: number, dto: UpdateEquipoDto, userToken: JwtPayload) {
    await this.findOneUseCase.execute(id, userToken);
    
    const equipo = await this.equiposRepo.preload({
      id_equipo: id,
      ...(dto as Partial<Equipos>),
    }); 

    if (!equipo) {
      throw new NotFoundException(`Equipo con id ${id} no encontrado`); 
    }

    return await this.equiposRepo.save(equipo); 
  }
}