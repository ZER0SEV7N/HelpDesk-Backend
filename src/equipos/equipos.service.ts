// src/equipos/equipos.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { Equipos } from '../entities/Equipos.entity';
import { Usuario } from '../entities/Usuario.entity';
import { CreateEquipoDTO } from './dto/create-equipos.dto';
import { UpdateEquipoDto } from './dto/update-equipos.dto';
import { JwtPayload } from '../common/guards/jwt-auth.guard';
import { FilterEquipoDto } from './dto/filter-equipo.dto';

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

  async findAll(
    userToken: JwtPayload,
    filters: FilterEquipoDto = {} as FilterEquipoDto,
  ) {
    const usuarioReal = await this.usuarioRepo.findOneBy({
      id_usuario: userToken.userId,
    });
    if (!usuarioReal) throw new NotFoundException('Usuario no válido');

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const skip = (page - 1) * limit;

    const isActiveFilter = filters.is_active !== undefined ? filters.is_active : true;

    const query = this.equiposRepo
      .createQueryBuilder('equipo')
      .leftJoinAndSelect('equipo.cliente', 'cliente')
      .leftJoinAndSelect('equipo.sucursal', 'sucursal')
      .leftJoinAndSelect('equipo.historial_hardware', 'historial_hardware')
      .leftJoinAndSelect('historial_hardware.hardware', 'hardware')
      .leftJoinAndSelect('equipo.software_instalado', 'software_instalado')
      .leftJoin('software_instalado.soft', 'soft')
      .addSelect(['soft.id_software', 'soft.nombre_software', 'soft.licencia'])
      .where('equipo.is_active = :isActive', { isActive: isActiveFilter })
      .skip(skip)
      .take(limit);

    if (filters.search) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('LOWER(equipo.tipo) LIKE LOWER(:search)', {
            search: `%${filters.search}%`,
          })
            .orWhere('LOWER(equipo.marca) LIKE LOWER(:search)', {
              search: `%${filters.search}%`,
            })
            .orWhere('LOWER(equipo.numero_serie) LIKE LOWER(:search)', {
              search: `%${filters.search}%`,
            })
            .orWhere('LOWER(equipo.area) LIKE LOWER(:search)', {
              search: `%${filters.search}%`,
            })
            .orWhere('LOWER(equipo.nombre_usuario) LIKE LOWER(:search)', {
              search: `%${filters.search}%`,
            });
        }),
      );
    }

    // Filtros específicos
    if (filters.tipo) {
      query.andWhere('LOWER(equipo.tipo) = LOWER(:tipo)', {
        tipo: filters.tipo,
      });
    }

    if (filters.marca) {
      query.andWhere('LOWER(equipo.marca) = LOWER(:marca)', {
        marca: filters.marca,
      });
    }

    if (filters.numero_serie) {
      query.andWhere('equipo.numero_serie = :numero_serie', {
        numero_serie: filters.numero_serie,
      });
    }

    if (filters.area) {
      query.andWhere('LOWER(equipo.area) LIKE LOWER(:area)', {
        area: `%${filters.area}%`,
      });
    }

    if (filters.id_cliente) {
      query.andWhere('equipo.id_cliente = :filterIdCliente', {
        filterIdCliente: filters.id_cliente,
      });
    }

    if (filters.id_sucursal) {
      query.andWhere('equipo.id_sucursal = :filterIdSucursal', {
        filterIdSucursal: filters.id_sucursal,
      });
    }

    if (filters.id_trabajador) {
      query.andWhere('equipo.id_trabajador = :filterIdTrabajador', {
        filterIdTrabajador: filters.id_trabajador,
      });
    }

    // Control de roles de seguridad
    switch (userToken.role) {
      case 'ADMINISTRADOR':
      case 'SOPORTE_TECNICO':
      case 'SOPORTE_INSITU':
        break;
      case 'CLIENTE_EMPRESA':
        query.andWhere('equipo.id_cliente = :securityIdCliente', {
          securityIdCliente: usuarioReal.id_cliente,
        });
        break;
      case 'CLIENTE_SUCURSAL':
        query.andWhere('equipo.id_sucursal = :securityIdSucursal', {
          securityIdSucursal: usuarioReal.id_sucursal,
        });
        break;
      case 'CLIENTE_TRABAJADOR':
        query.andWhere('equipo.id_trabajador = :securityIdTrabajador', {
          securityIdTrabajador: usuarioReal.id_usuario,
        });
        break;
      default:
        throw new ForbiddenException(
          'No tienes permisos para ver el inventario.',
        );
    }

    const [equipos, total] = await query.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      data: equipos,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: number, userToken: JwtPayload) {
    const { data: equiposPermitidos } = await this.findAll(userToken, {
      limit: 9999,
      is_active: undefined, // Permite consultar el detalle sin restringir estado activo
    } as FilterEquipoDto);
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
    id_trabajador: number,
    nombre_usuario: string,
    area: string,
    id_sucursal: number,
    userToken: JwtPayload,
  ) {
    const equipo = await this.findOne(id, userToken);

    equipo.id_trabajador = id_trabajador;
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
    equipo.id_trabajador = undefined;
    equipo.nombre_usuario = 'Sin asignar';
    equipo.area = 'Sin asignar';
    const equipoActualizado = await this.equiposRepo.save(equipo);
    return {
      message: `Equipo liberado exitosamente`,
      equipo: equipoActualizado,
    };
  }
}