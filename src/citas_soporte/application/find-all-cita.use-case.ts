import { Citas_Soporte } from '@/entities/Citas-Soporte.entity';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CitaResponseDto } from '../dto/cita-response.dto';
import { JwtPayload } from '@/common/guards/jwt-auth.guard';

@Injectable()
export class FindAllCitaUseCase {
  constructor(
    @InjectRepository(Citas_Soporte)
    private readonly citasRepository: Repository<Citas_Soporte>,
  ) {}

  async execute(userToken: JwtPayload): Promise<CitaResponseDto[]> {
    // Construir la consulta para obtener todas las citas, incluyendo las relaciones necesarias
    const query = this.citasRepository
      .createQueryBuilder('cita')
      .leftJoinAndSelect('cita.sucursal', 'sucursal')
      .leftJoinAndSelect('sucursal.cliente', 'cliente')
      .leftJoinAndSelect('cita.soporte_insitu', 'soporte_insitu')
      .leftJoinAndSelect('cita.tickets', 'tickets');

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
    }
    const citas = await query.getMany();
    return CitaResponseDto.initList(citas);
  }
}
