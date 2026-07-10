import { JwtPayload } from '@/common/guards/jwt-auth.guard';
import { Equipos } from '@/entities/Equipos.entity';
import { Usuario } from '@/entities/Usuario.entity';
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class FindAllEquiposUseCase {
  constructor(
    @InjectRepository(Equipos)
    private readonly equiposRepo: Repository<Equipos>,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) {}

  async execute(userToken: JwtPayload) {
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
        throw new ForbiddenException('No tienes permisos para ver el inventario.'); 
    } 

    return await query.getMany(); 
  }
}