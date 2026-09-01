import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtPayload } from '@/common/guards/jwt-auth.guard';
import { Equipos } from '@/entities/Equipos.entity';
import { Usuario } from '@/entities/Usuario.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class FindOneEquipoUseCase {
  constructor(
    @InjectRepository(Equipos)
    private readonly equiposRepo: Repository<Equipos>,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) {}

  async execute(id: number, userToken: JwtPayload) {
<<<<<<< HEAD
    const equipo = await this.findAllUseCase.findOneById(id, userToken);

    if (!equipo) {
      throw new NotFoundException(
        `Equipo con id ${id} no encontrado o no tienes permiso para verlo`,
      );
    }

    return equipo;
=======
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
      .where('equipo.id_equipo = :id', { id })
      .andWhere('equipo.is_active = :isActive', { isActive: true });

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
        query.andWhere('equipo.id_trabajador = :idTrabajador', {
          idTrabajador: usuarioReal.id_usuario,
        });
        break;
      default:
        throw new ForbiddenException(
          'No tienes permisos para ver este equipo.',
        );
    }

    return await query.getOne();
>>>>>>> origin/leandro
  }
}
