import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FindOneEquipoUseCase } from './find-one-equipo.use-case';
import { Equipos } from '@/entities/Equipos.entity';
import { Usuario } from '@/entities/Usuario.entity';
import { Sucursales } from '@/entities/Sucursales.entity';
import { JwtPayload } from '@/common/guards/jwt-auth.guard';
import { GetProfileUseCase } from '@/modules/usuario/application/get-profile.use-case';

@Injectable()
export class AssignEquipoUseCase {
  constructor(
    @InjectRepository(Equipos)
    private readonly equiposRepo: Repository<Equipos>,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(Sucursales)
    private readonly sucursalRepo: Repository<Sucursales>,
    private readonly findOneUseCase: FindOneEquipoUseCase,
    private readonly getProfileUseCase: GetProfileUseCase,
  ) {}

  async execute(
    id: number, id_trabajador: number, area: string, userToken: JwtPayload,
  ) {
    // Validar que el equipo exista y que el usuario tenga permisos para asignarlo
    const equipo = await this.findOneUseCase.execute(id, userToken);
    // Validar que el equipo no esté asignado a otro trabajador
    if (equipo.id_trabajador) {
      throw new BadRequestException(
        `El equipo ya está asignado a otro trabajador (ID: ${equipo.id_trabajador})`,
      );
    }
    // Validar que el trabajador exista
    const trabajador = await this.getProfileUseCase.execute(id_trabajador);
    // Validar que el trabajador pertenezca al mismo cliente que el equipo
    if (trabajador.id_cliente !== equipo.id_cliente) {
      throw new BadRequestException("El trabajador no pertenece al mismo cliente que el equipo");
    }
    // Validar que el trabajador pertenezca a la misma sucursal que el equipo, si aplica
    if (equipo.id_sucursal && trabajador.id_sucursal !== equipo.id_sucursal) {
      throw new BadRequestException("El trabajador no pertenece a la misma sucursal que el equipo");
    }
    // Asignar el equipo al trabajador y actualizar el área
    equipo.id_trabajador = id_trabajador;
    equipo.area = area;

    const equipoActualizado = await this.equiposRepo.save(equipo); 
    
    return {
      message: `Equipo asignado exitosamente en el área de ${area}`,
      equipo: equipoActualizado,
    };
  }
}