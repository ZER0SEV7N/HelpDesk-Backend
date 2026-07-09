// src/equipos/equipos.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Equipos } from '../entities/Equipos.entity';
import { Usuario } from '../entities/Usuario.entity';
import { CreateEquipoDTO } from './dto/create-equipos.dto';
import { UpdateEquipoDto } from './dto/update-equipos.dto';
import { JwtPayload } from '../common/guards/jwt-auth.guard';

@Injectable()
export class EquiposService {
  constructor(
    @InjectRepository(Equipos)
    private readonly equiposRepo: Repository<Equipos>,

    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) {}

  async create(dto: CreateEquipoDTO) {
    const equipo = this.equiposRepo.create(dto as Partial<Equipos>);
    return await this.equiposRepo.save(equipo);
  }

  async findAll(userToken: JwtPayload) {
    const usuarioReal = await this.usuarioRepo.findOneBy({
      id_usuario: userToken.userId,
    });
    if (!usuarioReal) throw new NotFoundException('Usuario no válido');

    const query = this.equiposRepo
      .createQueryBuilder('equipo')
      .leftJoinAndSelect('equipo.cliente', 'cliente')
      .leftJoinAndSelect('equipo.sucursal', 'sucursal')
      .leftJoinAndSelect('equipo.historial_hardware', 'historial_hardware')
      .leftJoinAndSelect('historial_hardware.hardware', 'hardware')
      .leftJoinAndSelect('equipo.software_instalado', 'software_instalado')
      .leftJoin('software_instalado.soft', 'soft')
      .addSelect(['soft.id_software', 'soft.nombre_software', 'soft.licencia'])
      .where('equipo.is_active = :isActive', { isActive: true });

    switch (userToken.role) {
      case 'ADMINISTRADOR':
      case 'SOPORTE_TECNICO':
      case 'SOPORTE_INSITU':
        break;

      case 'CLIENTE_EMPRESA':
        query.andWhere('equipo.id_cliente = :idCliente', {
          idCliente: usuarioReal.id_cliente,
        });
        break;

      case 'CLIENTE_SUCURSAL':
        query.andWhere('equipo.id_sucursal = :idSucursal', {
          idSucursal: usuarioReal.id_sucursal,
        });
        break;

      case 'CLIENTE_TRABAJADOR':
        query.andWhere('equipo.nombre_usuario = :nombre', {
          nombre: usuarioReal.nombre,
        });
        break;

      default:
        throw new ForbiddenException(
          'No tienes permisos para ver el inventario.',
        );
    }

    return await query.getMany();
  }

  async findOne(id: number, userToken: JwtPayload) {
    const equiposPermitidos = await this.findAll(userToken);
    const equipo = equiposPermitidos.find((e) => e.id_equipo === id);

    if (!equipo) {
      throw new NotFoundException(
        `Equipo con id ${id} no encontrado o no tienes permiso para verlo`,
      );
    }

    return equipo;
  }

  async update(id: number, dto: UpdateEquipoDto, userToken: JwtPayload) {
    await this.findOne(id, userToken);

    const equipo = await this.equiposRepo.preload({
      id_equipo: id,
      ...(dto as Partial<Equipos>),
    });

    if (!equipo) {
      throw new NotFoundException(`Equipo con id ${id} no encontrado`);
    }

    return await this.equiposRepo.save(equipo);
  }

  async remove(id: number, userToken: JwtPayload) {
    const equipo = await this.findOne(id, userToken);

    if (!equipo.is_active)
      throw new BadRequestException('El equipo ya está inactivo');

    equipo.is_active = false;
    await this.equiposRepo.save(equipo);

    return {
      message: `Equipo con id ${id} dado de baja correctamente del sistema`,
    };
  }

  async assignToWorker(
    id: number,
    nombre_usuario: string,
    area: string,
    id_sucursal: number | undefined,
    userToken: JwtPayload,
  ) {
    const equipo = await this.findOne(id, userToken);

    equipo.nombre_usuario = nombre_usuario;
    equipo.area = area;

    if (id_sucursal) equipo.id_sucursal = id_sucursal;

    const equipoActualizado = await this.equiposRepo.save(equipo);
    return {
      message: `Equipo asignado exitosamente a ${nombre_usuario} en el área de ${area}`,
      equipo: equipoActualizado,
    };
  }

  async unassignFromWorker(id: number, userToken: JwtPayload) {
    const equipo = await this.findOne(id, userToken);
    equipo.nombre_usuario = 'Sin asignar';
    equipo.area = 'Sin asignar';
    const equipoActualizado = await this.equiposRepo.save(equipo);
    return {
      message: `Equipo liberado exitosamente`,
      equipo: equipoActualizado,
    };
  }
}
