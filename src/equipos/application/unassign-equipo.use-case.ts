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
    // Validar que el equipo exista y que el usuario tenga permisos para desasignarlo
    const equipo = await this.findOneUseCase.execute(id, userToken); 
    // Desasignar el equipo del trabajador y actualizar el área a "Sin asignar"
    equipo.id_trabajador = null as any;
    equipo.area = 'Sin asignar'; 

    // Guardar los cambios en la base de datos
    const equipoActualizado = await this.equiposRepo.save(equipo); 
    // Retornar un mensaje de éxito y el equipo actualizado
    return {
      message: `Equipo liberado exitosamente`,
      equipo: equipoActualizado,
    }; 
  }
}