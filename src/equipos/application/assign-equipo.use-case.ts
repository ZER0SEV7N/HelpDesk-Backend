import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FindOneEquipoUseCase } from './find-one-equipo.use-case';
import { Equipos } from '@/entities/Equipos.entity';
import { Usuario } from '@/entities/Usuario.entity';
import { Sucursales } from '@/entities/Sucursales.entity';
import { JwtPayload } from '@/common/guards/jwt-auth.guard';

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
      throw new ConflictException(
        `El equipo ya está asignado a otro trabajador (ID: ${equipo.id_trabajador})`,
      );
    }

    // Validar que el trabajador exista y pertenezca a la MISMA empresa que el equipo
    const trabajador = await this.usuarioRepo.findOneBy({
      id_usuario: id_trabajador,
    });
    if (!trabajador) {
      throw new BadRequestException(
        `El trabajador con ID ${id_trabajador} no existe`,
      );
    }
    if (trabajador.id_cliente !== equipo.id_cliente) {
      throw new BadRequestException(
        'El trabajador no pertenece a la empresa de este equipo',
      );
    }
    // Si el equipo ya tiene sucursal asignada, el trabajador debe ser de la misma
    if (equipo.id_sucursal && trabajador.id_sucursal !== equipo.id_sucursal) {
      throw new BadRequestException(
        'El trabajador no pertenece a la sucursal de este equipo',
      );
    }

    // Si se proporciona un id_sucursal, validar que exista y sea de la MISMA empresa
    if (id_sucursal) {
      const sucursal = await this.sucursalRepo.findOneBy({
        id_sucursal,
      });
      if (!sucursal) {
        throw new BadRequestException(
          `La sucursal con ID ${id_sucursal} no existe`,
        );
      }
      if (sucursal.id_cliente !== equipo.id_cliente) {
        throw new BadRequestException(
          'La sucursal no pertenece a la empresa de este equipo',
        );
      }
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