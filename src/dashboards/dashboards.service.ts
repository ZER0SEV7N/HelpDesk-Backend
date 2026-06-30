import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tickets, TicketStatus } from '../entities/Tickets.entity';
import { Usuario } from '../entities/Usuario.entity';
import { Equipos } from '../entities/Equipos.entity';

@Injectable()
export class DashboardsService {
  constructor(
    @InjectRepository(Tickets) private readonly ticketRepo: Repository<Tickets>,
    @InjectRepository(Usuario) private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(Equipos) private readonly equipoRepo: Repository<Equipos>,
  ) {}

  async getAdminDashboard() {
    const [
      totalTickets,
      pendientes,
      enProgreso,
      cerrados,
      asignados,
      reabiertos,
    ] = await Promise.all([
      this.ticketRepo.count(),
      this.ticketRepo.count({ where: { estado: TicketStatus.PENDIENTE } }),
      this.ticketRepo.count({ where: { estado: TicketStatus.EN_PROGRESO } }),
      this.ticketRepo.count({ where: { estado: TicketStatus.CERRADO } }),
      this.ticketRepo.count({ where: { estado: TicketStatus.ASIGNADO } }),
      this.ticketRepo.count({ where: { estado: TicketStatus.REABIERTO } }),
    ]);

    const abiertos = pendientes + asignados + enProgreso + reabiertos;
    const resueltos = cerrados;

    const cronograma = await this.equipoRepo
      .createQueryBuilder('equipo')
      .where('equipo.rev_programada IS NOT NULL')
      .andWhere('equipo.rev_programada >= CURRENT_DATE')
      .orderBy('equipo.rev_programada', 'ASC')
      .select([
        'equipo.id_equipo',
        'equipo.tipo',
        'equipo.marca',
        'equipo.nombre_usuario',
        'equipo.area',
        'equipo.rev_programada',
        'equipo.id_cliente',
      ])
      .getMany();

    const desempenoRaw = await this.ticketRepo
      .createQueryBuilder('ticket')
      .innerJoin('ticket.soporte', 'soporte')
      .where('ticket.id_soporte IS NOT NULL')
      .groupBy('soporte.id_usuario')
      .addSelect('soporte.id_usuario', 'idSoporte')
      .addSelect('soporte.nombre', 'nombreSoporte')
      .addSelect('soporte.apellido', 'apellidoSoporte')
      .addSelect('COUNT(*)', 'totalAsignados')
      .addSelect(
        'SUM(CASE WHEN ticket.estado = :cerrado THEN 1 ELSE 0 END)',
        'resueltos',
      )
      .setParameter('cerrado', TicketStatus.CERRADO)
      .getRawMany();

    const desempeno = desempenoRaw.map((row) => {
      const total = parseInt(row.totalAsignados, 10);
      const resueltosCount = parseInt(row.resueltos, 10);
      const porcentaje =
        total > 0 ? parseFloat((resueltosCount / total * 100).toFixed(2)) : 0;
      let calificacion = 'Sin datos';
      if (total > 0) {
        if (porcentaje >= 80) calificacion = 'Excelente';
        else if (porcentaje >= 50) calificacion = 'Regular';
        else calificacion = 'Deficiente';
      }
      return {
        idSoporte: parseInt(row.idSoporte, 10),
        nombre: row.nombreSoporte,
        apellido: row.apellidoSoporte,
        totalAsignados: total,
        resueltos: resueltosCount,
        porcentajeResueltos: porcentaje,
        calificacion,
      };
    });

    return {
      resumen: {
        totalTickets,
        abiertos,
        pendientes,
        cerrados,
        enProgreso,
        resueltos,
      },
      cronograma: cronograma.map((e) => ({
        idEquipo: e.id_equipo,
        tipo: e.tipo,
        marca: e.marca,
        nombreUsuario: e.nombre_usuario,
        area: e.area,
        proximaRevision: e.revProgramada,
        idCliente: e.id_cliente,
      })),
      desempeno,
    };
  }
}
