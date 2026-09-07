import { JwtPayload } from '@/common/guards/jwt-auth.guard';
import { Equipos } from '@/entities/Equipos.entity';
import { Usuario } from '@/entities/Usuario.entity';
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { FilterEquipoDto } from '@/equipos/dto/filter-equipo.dto';

@Injectable()
export class FindAllEquiposUseCase {
  constructor(
    @InjectRepository(Equipos)
    private readonly equiposRepo: Repository<Equipos>,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) {}

  async execute(
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

    const query = this.equiposRepo
      .createQueryBuilder('equipo')
      .leftJoinAndSelect('equipo.cliente', 'cliente')
      .leftJoinAndSelect('equipo.sucursal', 'sucursal')
      .leftJoinAndSelect('equipo.historial_hardware', 'historial_hardware')
      .leftJoinAndSelect('historial_hardware.hardware', 'hardware')
      .leftJoinAndSelect('equipo.software_instalado', 'software_instalado')
      .leftJoin('software_instalado.soft', 'soft')
      .addSelect(['soft.id_software', 'soft.nombre_software', 'soft.licencia'])
      .where('equipo.is_active = :isActive', { isActive: true })
      .skip(skip)
      .take(limit);

    if (filters.search) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('LOWER(equipo.nombre) LIKE LOWER(:search)', {
            search: `%${filters.search}%`,
          })
            .orWhere('LOWER(equipo.codigo) LIKE LOWER(:search)', {
              search: `%${filters.search}%`,
            })
            .orWhere('LOWER(equipo.numero_serie) LIKE LOWER(:search)', {
              search: `%${filters.search}%`,
            });
        }),
      );
    }
    if (filters.id_cliente)
      query.andWhere('equipo.id_cliente = :filterIdCliente', {
        filterIdCliente: filters.id_cliente,
      });
    if (filters.id_sucursal)
      query.andWhere('equipo.id_sucursal = :filterIdSucursal', {
        filterIdSucursal: filters.id_sucursal,
      });

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
}
