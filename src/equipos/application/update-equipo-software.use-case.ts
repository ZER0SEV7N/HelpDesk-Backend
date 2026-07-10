import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FindOneEquipoUseCase } from './find-one-equipo.use-case';
import { Software_equipos } from '@/entities/SoftwareEquipos.entity';
import { UpdateEquipoSoftwareDto } from '../dto/update-equipo-software.dto';
import { JwtPayload } from '@/common/guards/jwt-auth.guard';

@Injectable()
export class UpdateEquipoSoftwareUseCase {
  constructor(
    @InjectRepository(Software_equipos)
    private readonly softwareEquiposRepo: Repository<Software_equipos>,
    private readonly findOneUseCase: FindOneEquipoUseCase,
  ) {}

  async execute(
    id_equipo: number,
    id_instalacion: number,
    dto: UpdateEquipoSoftwareDto,
    userToken: JwtPayload,
  ) {
    await this.findOneUseCase.execute(id_equipo, userToken);

    const instalacion = await this.softwareEquiposRepo.findOne({
      where: { id_software_equipos: id_instalacion, equipo: { id_equipo } },
    });

    if (!instalacion) {
      throw new NotFoundException(
        `Componente de software ${id_instalacion} no encontrado en el equipo ${id_equipo}`,
      ); 
    }

    const { fecha_instalacion, ...rest } = dto; 
    Object.assign(instalacion, rest); 

    if (fecha_instalacion) {
      instalacion.fecha_instalacion = new Date(fecha_instalacion);
    } 

    const actualizado = await this.softwareEquiposRepo.save(instalacion); 
    return {
      message: 'Componente de software actualizado exitosamente',
      componente: actualizado,
    }; 
  }
}