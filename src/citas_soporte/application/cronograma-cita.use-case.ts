import { Citas_Soporte } from '@/entities/Citas-Soporte.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtPayload } from '@/common/guards/jwt-auth.guard';
import { Repository } from 'typeorm';
import { CitaCronogramaResponseDto } from '../dto/cita-cronograma-response.dto';

@Injectable()
export class CronogramaCitaUseCase {
  constructor(
    @InjectRepository(Citas_Soporte)
    private readonly citasRepository: Repository<Citas_Soporte>,
  ) {}

  async execute(userToken: JwtPayload): Promise<CitaCronogramaResponseDto[]> {
    // Construir la consulta para obtener todas las citas, incluyendo las relaciones necesarias
    const query = this.citasRepository
      .createQueryBuilder('cita')
      .select([
        'cita.id_cita',
        'cita.fecha_programada',
        'cita.estado',
        'sucursal.id_sucursal',
        'sucursal.nombre_sucursal',
        'cliente.id_cliente',
        'cliente.nombre_principal',
      ])
      .leftJoin('cita.sucursal', 'sucursal')
      .leftJoin('sucursal.cliente', 'cliente')
      .leftJoin('cita.soporte_insitu', 'soporte_insitu')
      .leftJoin('cita.tickets', 'tickets')
      .leftJoin('tickets.trabajador', 'trabajador');

    switch (userToken.role) {
      // Si el usuario es ADMINISTRADOR mostrar todas las citas
      case 'ADMINISTRADOR':
        break;
      // Si el usuario es SOPORTE_TECNICO mostrar todas las citas vinculadas a el
      case 'SOPORTE_INSITU':
        query.andWhere('soporte_insitu.id_usuario = :idUsuario', {
          idUsuario: userToken.userId,
        });
        break;
      case 'CLIENTE_EMPRESA':
        query.andWhere('cliente.id_cliente = :idCliente', {
          idCliente: userToken.clienteId,
        });
        break;
      case 'CLIENTE_SUCURSAL':
        query.andWhere('sucursal.id_sucursal = :idSucursal', {
          idSucursal: userToken.sucursalId,
        });
        break;
      case 'CLIENTE_TRABAJADOR':
        query.andWhere('sucursal.id_sucursal = :idSucursal', {
          idSucursal: userToken.sucursalId,
        });
        break;
      default:
        throw new Error('Rol de usuario no válido');
    }
    const citas = await query.getMany();
    return CitaCronogramaResponseDto.initList(citas);
  }
}
