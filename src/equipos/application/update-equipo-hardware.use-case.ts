import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FindOneEquipoUseCase } from './find-one-equipo.use-case';
import { RegistroHardware } from '@/entities/RegistroHardware.entity';
import { UpdateEquipoHardwareDto } from '../dto/update-equipo-hardware.dto';
import { JwtPayload } from '@/common/guards/jwt-auth.guard';


@Injectable()
export class UpdateEquipoHardwareUseCase {
  constructor(
    @InjectRepository(RegistroHardware)
    private readonly regHardRepo: Repository<RegistroHardware>,
    private readonly findOneUseCase: FindOneEquipoUseCase,
  ) {}

  async execute(
    id_equipo: number,
    id_registro: number,
    dto: UpdateEquipoHardwareDto,
    userToken: JwtPayload,
  ) {
    await this.findOneUseCase.execute(id_equipo, userToken); 

    const registro = await this.regHardRepo.findOne({
      where: { id_RH: id_registro, id_equipo },
    });

    if (!registro) {
      throw new NotFoundException(
        `Componente de hardware ${id_registro} no encontrado en el equipo ${id_equipo}`,
      ); 
    }

    const { fecha_instalacion, ...rest } = dto; 
    Object.assign(registro, rest); 

    if (fecha_instalacion) {
      registro.fecha_instalacion = new Date(fecha_instalacion);
    }

    const actualizado = await this.regHardRepo.save(registro);
    return {
      message: 'Componente de hardware actualizado exitosamente',
      componente: actualizado,
    }; 
  }
}