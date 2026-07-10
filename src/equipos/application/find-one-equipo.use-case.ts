import { Injectable, NotFoundException } from '@nestjs/common';
import { FindAllEquiposUseCase } from './find-all-equipos.use-case';
import { JwtPayload } from '@/common/guards/jwt-auth.guard';

@Injectable()
export class FindOneEquipoUseCase {
  constructor(private readonly findAllUseCase: FindAllEquiposUseCase) {}

  async execute(id: number, userToken: JwtPayload) {
    const equiposPermitidos = await this.findAllUseCase.execute(userToken);
    const equipo = equiposPermitidos.find((e) => e.id_equipo === id);

    if (!equipo) {
      throw new NotFoundException(
        `Equipo con id ${id} no encontrado o no tienes permiso para verlo`,
      ); 
    }

    return equipo; 
  }
}