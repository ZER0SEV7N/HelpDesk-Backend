import { Citas_Soporte } from '@/entities/Citas-Soporte.entity';
import { Injectable } from '@nestjs/common';
import { Repository, Brackets } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CitaResponseDto } from '../dto/cita-response.dto';
import { JwtPayload } from '@/common/guards/jwt-auth.guard';
import { FilterCitaDto } from '../dto/filter-cita.dto';

@Injectable()
export class FindAllCitaUseCase {
  constructor(
    @InjectRepository(Citas_Soporte)
    private readonly citasRepository: Repository<Citas_Soporte>,
  ) {}

  async execute(
    userToken: JwtPayload,
    filters: FilterCitaDto = {} as FilterCitaDto,
  ) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const skip = (page - 1) * limit;

    const query = this.citasRepository
      .createQueryBuilder('cita')
      .leftJoinAndSelect('cita.sucursal', 'sucursal')
      .leftJoinAndSelect('sucursal.cliente', 'cliente')
      .leftJoinAndSelect('cita.soporte_insitu', 'soporte_insitu')
      .leftJoinAndSelect('cita.tickets', 'tickets')
      .skip(skip)
      .take(limit);

    if (filters.estado)
      query.andWhere('cita.estado = :estado', { estado: filters.estado });
    if (filters.id_soporte)
      query.andWhere('cita.id_soporte = :id_soporte', {
        id_soporte: filters.id_soporte,
      });
    if (filters.id_sucursal)
      query.andWhere('cita.id_sucursal = :id_sucursal', {
        id_sucursal: filters.id_sucursal,
      });
    if (filters.id_cliente)
      query.andWhere('cliente.id_cliente = :idCliente', {
        idCliente: filters.id_cliente,
      });
    if (filters.search) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('LOWER(soporte_insitu.nombre) LIKE LOWER(:search)', {
            search: `%${filters.search}%`,
          }).orWhere('LOWER(soporte_insitu.apellido) LIKE LOWER(:search)', {
            search: `%${filters.search}%`,
          });
        }),
      );
    }
    if (filters.mes !== undefined && filters.anio !== undefined) {
      const inicioMes = new Date(filters.anio, filters.mes - 1, 1, 0, 0, 0, 0);
      const finMes = new Date(filters.anio, filters.mes, 0, 23, 59, 59, 999);
      query.andWhere('cita.fecha_programada >= :inicioMes', { inicioMes });
      query.andWhere('cita.fecha_programada <= :finMes', { finMes });
    }
    if (filters.fechaInicio) {
      const fechaInicio = new Date(filters.fechaInicio);
      fechaInicio.setHours(0, 0, 0, 0);
      query.andWhere('cita.fecha_programada >= :fechaInicio', { fechaInicio });
    }
    if (filters.fechaFin) {
      const fechaFin = new Date(filters.fechaFin);
      fechaFin.setHours(23, 59, 59, 999);
      query.andWhere('cita.fecha_programada <= :fechaFin', { fechaFin });
    }

    switch (userToken.role) {
      case 'ADMINISTRADOR':
        break;
      case 'SOPORTE_INSITU':
        query.andWhere('soporte_insitu.id_usuario = :idUsuario', {
          idUsuario: userToken.userId,
        });
        break;
    }

    const [entities, total] = await query.getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      data: CitaResponseDto.initList(entities),
      total,
      page,
      limit,
      totalPages,
    };
  }
}
