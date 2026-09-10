import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Tickets, TicketStatus } from '../entities/Tickets.entity';
import { Usuario } from '../entities/Usuario.entity';
import { Equipos } from '../entities/Equipos.entity';
import { Citas_Soporte, EstadoCita } from '../entities/Citas-Soporte.entity';
import { Clientes } from '../entities/Clientes.entity';
import { Sucursales } from '../entities/Sucursales.entity';
import { JwtPayload } from '../common/guards/jwt-auth.guard';

@Injectable()
export class DashboardsService {
  constructor(
    @InjectRepository(Tickets) private readonly ticketRepo: Repository<Tickets>,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(Equipos) private readonly equipoRepo: Repository<Equipos>,
    @InjectRepository(Citas_Soporte)
    private readonly citasRepo: Repository<Citas_Soporte>,
    @InjectRepository(Clientes)
    private readonly clienteRepo: Repository<Clientes>,
    @InjectRepository(Sucursales)
    private readonly sucursalRepo: Repository<Sucursales>,
  ) {}

  /**
   * =========================================================================
   * MÉTODO PRINCIPAL (ORQUESTADOR): GET DASHBOARD
   * =========================================================================
   * Evalúa el rol del usuario autenticado proveniente del JWT y despacha
   * automáticamente el caso de uso y la vista de dashboard que le corresponde.
   *
   * @param user Payload del JWT con id_usuario, rol, clienteId y sucursalId
   * @returns Datos y métricas específicas del rol del usuario
   */
  async getDashboard(user: JwtPayload) {
    switch (user.role) {
      // 1. Administrador global del sistema HelpDesk
      case 'ADMINISTRADOR':
        return this.getAdminDashboard();

      // 2. Técnico de Soporte Remoto
      case 'SOPORTE_TECNICO':
        return this.getSoporteTecnicoDashboard(user);

      // 3. Técnico de Soporte Presencial / En Campo
      case 'SOPORTE_INSITU':
        return this.getSoporteInsituDashboard(user);

      // 4. Administrador / Gerente de la Empresa Cliente
      case 'CLIENTE_EMPRESA':
        return this.getClienteEmpresaDashboard(user);

      // 5. Encargado / Gerente de Sucursal de la Empresa Cliente
      case 'CLIENTE_SUCURSAL':
        return this.getClienteSucursalDashboard(user);

      // 6. Trabajador / Empleado Final de la Empresa
      case 'CLIENTE_TRABAJADOR':
        return this.getClienteTrabajadorDashboard(user);

      // Caso por defecto: Rol desconocido o sin permisos
      default:
        throw new ForbiddenException(
          `El rol '${user.role}' no tiene un dashboard configurado o no está autorizado.`,
        );
    }
  }

  // 1. DASHBOARD ADMINISTRADOR (Métricas Globales de Todo el HelpDesk)
  async getAdminDashboard() {
    // 1. Conteo de métricas globales de tickets en paralelo para máxima velocidad
    const [
      totalTickets,
      pendientes,
      enProgreso,
      cerrados,
      asignados,
      reabiertos,
    ] = await Promise.all([
      this.ticketRepo.count(), // Total histórico de tickets en la plataforma
      this.ticketRepo.count({ where: { estado: TicketStatus.PENDIENTE } }), // Tickets esperando asignación
      this.ticketRepo.count({ where: { estado: TicketStatus.EN_PROGRESO } }), // Tickets en atención activa
      this.ticketRepo.count({ where: { estado: TicketStatus.CERRADO } }), // Tickets resueltos y finalizados
      this.ticketRepo.count({ where: { estado: TicketStatus.ASIGNADO } }), // Tickets asignados a un técnico
      this.ticketRepo.count({ where: { estado: TicketStatus.REABIERTO } }), // Tickets reabiertos por inconformidad
    ]);

    //Cálculo consolidado de tickets activos (abiertos) y resueltos
    const abiertos = pendientes + asignados + enProgreso + reabiertos;
    const resueltos = cerrados;

    //Cronograma global de equipos con revisión técnica programada pendiente o próxima
    const cronograma = await this.equipoRepo
      .createQueryBuilder('equipo')
      .where('equipo.revProgramada IS NOT NULL')
      .andWhere('equipo.revProgramada >= CURRENT_DATE') // Solo revisiones de hoy en adelante
      .orderBy('equipo.revProgramada', 'ASC') // Orden cronológico más próximo primero
      .select([
        'equipo.id_equipo',
        'equipo.tipo',
        'equipo.marca',
        'equipo.nombre_usuario',
        'equipo.area',
        'equipo.revProgramada',
        'equipo.id_cliente',
      ])
      .getMany();

    //Evaluación de desempeño individual de todos los técnicos de soporte
    const desempenoRaw = await this.ticketRepo
      .createQueryBuilder('ticket')
      .innerJoin('ticket.soporte', 'soporte')
      .where('ticket.id_soporte IS NOT NULL')
      .select('soporte.id_usuario', 'idSoporte')
      .addSelect('soporte.nombre', 'nombreSoporte')
      .addSelect('soporte.apellido', 'apellidoSoporte')
      .addSelect('COUNT(ticket.id_ticket)', 'totalAsignados') // Total de casos asignados a este técnico
      .addSelect(
        'SUM(CASE WHEN ticket.estado = :cerrado THEN 1 ELSE 0 END)',
        'resueltos', // Total de casos que este técnico resolvió
      )
      .groupBy('soporte.id_usuario')
      .addGroupBy('soporte.nombre')
      .addGroupBy('soporte.apellido')
      .setParameter('cerrado', TicketStatus.CERRADO)
      .getRawMany();

    //Cálculo del porcentaje de efectividad y asignación de calificación cualitativa
    const desempeno = desempenoRaw.map((row) => {
      const total = parseInt(row.totalAsignados, 10);
      const resueltosCount = parseInt(row.resueltos, 10);
      const porcentaje =
        total > 0 ? parseFloat(((resueltosCount / total) * 100).toFixed(2)) : 0;
      
      // Calificación cualitativa según porcentaje de resolución
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

    //Retorno consolidado para la vista del Administrador
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

  // 2. DASHBOARD SOPORTE TÉCNICO (Panel Personal para Técnico Remoto)
  async getSoporteTecnicoDashboard(user: JwtPayload) {
    const soporteId = user.userId;

    //Conteo de métricas en paralelo 
    const [
      misAsignados,
      misEnProgreso,
      misReabiertos,
      misResueltos,
      colaPendientes,
    ] = await Promise.all([
      this.ticketRepo.count({
        where: { id_soporte: soporteId, estado: TicketStatus.ASIGNADO },
      }),
      this.ticketRepo.count({
        where: { id_soporte: soporteId, estado: TicketStatus.EN_PROGRESO },
      }),
      this.ticketRepo.count({
        where: { id_soporte: soporteId, estado: TicketStatus.REABIERTO }, // Alerta prioritaria
      }),
      this.ticketRepo.count({
        where: { id_soporte: soporteId, estado: TicketStatus.CERRADO },
      }),
      this.ticketRepo.count({
        where: { estado: TicketStatus.PENDIENTE }, // Tickets disponibles sin asignar
      }),
    ]);

    //Cálculo de totales y tasa de resolución personal
    const misTicketsTotal =
      misAsignados + misEnProgreso + misReabiertos + misResueltos;
    const misTicketsActivosCount = misAsignados + misEnProgreso + misReabiertos;
    const tasaResolucion =
      misTicketsTotal > 0
        ? parseFloat(((misResueltos / misTicketsTotal) * 100).toFixed(2))
        : 0;

    //Bandeja de trabajo activa: Tickets asignados a él que requieren atención
    const ticketsActivos = await this.ticketRepo
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.cliente', 'cliente')
      .leftJoinAndSelect('ticket.trabajador', 'trabajador')
      .leftJoinAndSelect('ticket.equipo', 'equipo')
      .leftJoinAndSelect('equipo.sucursal', 'sucursal')
      .where('ticket.id_soporte = :soporteId', { soporteId })
      .andWhere('ticket.estado IN (:...estadosActivos)', {
        estadosActivos: [
          TicketStatus.REABIERTO,
          TicketStatus.EN_PROGRESO,
          TicketStatus.ASIGNADO,
        ],
      })
      .orderBy('ticket.created_at', 'ASC') // Los más antiguos primero
      .getMany();

    //Cola de tickets pendientes disponibles para auto-asignarse (Top 10)
    const colaDisponible = await this.ticketRepo
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.cliente', 'cliente')
      .leftJoinAndSelect('ticket.trabajador', 'trabajador')
      .leftJoinAndSelect('ticket.equipo', 'equipo')
      .leftJoinAndSelect('equipo.sucursal', 'sucursal')
      .where('ticket.estado = :estadoPendiente', {
        estadoPendiente: TicketStatus.PENDIENTE,
      })
      .orderBy('ticket.created_at', 'ASC')
      .take(10)
      .getMany();

    //Últimos tickets resueltos por el técnico (Historial reciente)
    const ultimosResueltos = await this.ticketRepo
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.cliente', 'cliente')
      .leftJoinAndSelect('ticket.trabajador', 'trabajador')
      .where('ticket.id_soporte = :soporteId', { soporteId })
      .andWhere('ticket.estado = :estadoCerrado', {
        estadoCerrado: TicketStatus.CERRADO,
      })
      .orderBy('ticket.updated_at', 'DESC')
      .take(5)
      .getMany();

    //Retorno formateado para la interfaz del técnico de soporte
    return {
      resumen: {
        misTicketsTotal,
        misTicketsActivos: misTicketsActivosCount,
        misAsignados,
        misEnProgreso,
        misReabiertos,
        misResueltos,
        colaPendientes,
        tasaResolucion,
      },
      misTicketsActivos: ticketsActivos.map((t) => ({
        idTicket: t.id_ticket,
        pin: t.pin,
        asunto: t.asunto,
        estado: t.estado,
        esSoftware: t.es_software,
        cliente: t.cliente ? t.cliente.nombre_principal : 'N/A',
        sucursal:
          t.equipo && t.equipo.sucursal
            ? t.equipo.sucursal.nombre_sucursal
            : 'Principal',
        trabajador: t.trabajador
          ? `${t.trabajador.nombre} ${t.trabajador.apellido}`
          : 'Sin asignar',
        equipo: t.equipo
          ? `${t.equipo.tipo} (${t.equipo.marca})`
          : 'N/A',
        createdAt: t.created_at,
      })),
      colaDisponible: colaDisponible.map((t) => ({
        idTicket: t.id_ticket,
        pin: t.pin,
        asunto: t.asunto,
        cliente: t.cliente ? t.cliente.nombre_principal : 'N/A',
        sucursal:
          t.equipo && t.equipo.sucursal
            ? t.equipo.sucursal.nombre_sucursal
            : 'Principal',
        trabajador: t.trabajador
          ? `${t.trabajador.nombre} ${t.trabajador.apellido}`
          : 'Sin asignar',
        equipo: t.equipo
          ? `${t.equipo.tipo} (${t.equipo.marca})`
          : 'N/A',
        createdAt: t.created_at,
      })),
      ultimosResueltos: ultimosResueltos.map((t) => ({
        idTicket: t.id_ticket,
        pin: t.pin,
        asunto: t.asunto,
        cliente: t.cliente ? t.cliente.nombre_principal : 'N/A',
        trabajador: t.trabajador
          ? `${t.trabajador.nombre} ${t.trabajador.apellido}`
          : 'N/A',
        resueltoAt: t.updated_at,
      })),
    };
  }

  // 3. DASHBOARD SOPORTE IN-SITU (Visitas Técnicas y Rutas de Campo)
  async getSoporteInsituDashboard(user: JwtPayload) {
    const soporteId = user.userId;

    //Conteo de métricas de visitas/citas asignadas al técnico in situ
    const [
      citasPendientes,
      citasEnCamino,
      citasCompletadas,
      totalCitas,
    ] = await Promise.all([
      this.citasRepo.count({
        where: {
          soporte_insitu: { id_usuario: soporteId },
          estado: EstadoCita.PENDIENTE,
        },
      }),
      this.citasRepo.count({
        where: {
          soporte_insitu: { id_usuario: soporteId },
          estado: EstadoCita.EN_CAMINO,
        },
      }),
      this.citasRepo.count({
        where: {
          soporte_insitu: { id_usuario: soporteId },
          estado: EstadoCita.COMPLETADA,
        },
      }),
      this.citasRepo.count({
        where: { soporte_insitu: { id_usuario: soporteId } },
      }),
    ]);

    //Próximas citas / Agenda de visitas presenciales en ruta (Pendientes y En Camino)
    const proximasCitasRaw = await this.citasRepo
      .createQueryBuilder('cita')
      .innerJoinAndSelect('cita.sucursal', 'sucursal')
      .leftJoinAndSelect('sucursal.cliente', 'cliente')
      .leftJoinAndSelect('cita.soporte_insitu', 'soporte_insitu')
      .leftJoinAndSelect('cita.tickets', 'tickets')
      .leftJoinAndSelect('tickets.equipo', 'equipo')
      .leftJoinAndSelect('tickets.trabajador', 'trabajador')
      .where('soporte_insitu.id_usuario = :soporteId', { soporteId })
      .andWhere('cita.estado IN (:...estadosActivos)', {
        estadosActivos: [EstadoCita.PENDIENTE, EstadoCita.EN_CAMINO],
      })
      .orderBy('cita.fecha_programada', 'ASC')
      .getMany();

    //Historial de visitas presenciales completadas o canceladas recientemente (Top 5)
    const historialCitasRaw = await this.citasRepo
      .createQueryBuilder('cita')
      .innerJoinAndSelect('cita.sucursal', 'sucursal')
      .leftJoinAndSelect('sucursal.cliente', 'cliente')
      .leftJoinAndSelect('cita.soporte_insitu', 'soporte_insitu')
      .leftJoinAndSelect('cita.tickets', 'tickets')
      .where('soporte_insitu.id_usuario = :soporteId', { soporteId })
      .andWhere('cita.estado IN (:...estadosHistorial)', {
        estadosHistorial: [EstadoCita.COMPLETADA, EstadoCita.CANCELADA],
      })
      .orderBy('cita.fecha_programada', 'DESC')
      .take(5)
      .getMany();

    //Retorno consolidado para Soporte In Situ
    return {
      resumen: {
        totalCitas,
        citasPendientes,
        citasEnCamino,
        citasCompletadas,
        citasActivas: citasPendientes + citasEnCamino,
      },
      proximasCitas: proximasCitasRaw.map((c) => ({
        idCita: c.id_cita,
        fechaProgramada: c.fecha_programada,
        estado: c.estado,
        observaciones: c.observaciones,
        cliente:
          c.sucursal && c.sucursal.cliente
            ? c.sucursal.cliente.nombre_principal
            : 'N/A',
        sucursal: c.sucursal ? c.sucursal.nombre_sucursal : 'N/A',
        direccion: c.sucursal ? c.sucursal.direccion : 'N/A',
        encargado: c.sucursal ? c.sucursal.encargado : 'N/A',
        telefono: c.sucursal ? c.sucursal.telefono : 'N/A',
        tickets: (c.tickets || []).map((t) => ({
          idTicket: t.id_ticket,
          pin: t.pin,
          asunto: t.asunto,
          estado: t.estado,
          equipo: t.equipo ? `${t.equipo.tipo} (${t.equipo.marca})` : 'N/A',
          trabajador: t.trabajador
            ? `${t.trabajador.nombre} ${t.trabajador.apellido}`
            : 'Sin asignar',
        })),
      })),
      historialCitas: historialCitasRaw.map((c) => ({
        idCita: c.id_cita,
        fechaProgramada: c.fecha_programada,
        estado: c.estado,
        observaciones: c.observaciones,
        cliente:
          c.sucursal && c.sucursal.cliente
            ? c.sucursal.cliente.nombre_principal
            : 'N/A',
        sucursal: c.sucursal ? c.sucursal.nombre_sucursal : 'N/A',
        totalTickets: (c.tickets || []).length,
      })),
    };
  }

  // 4. DASHBOARD CLIENTE EMPRESA (Panel Gerencial de la Empresa Cliente)
  async getClienteEmpresaDashboard(user: JwtPayload) {
    //Validación de pertenencia del usuario a una empresa cliente
    const clienteId = user.clienteId;
    if (!clienteId) {
      throw new NotFoundException('Cliente ID no encontrado en el usuario');
    }

    //Obtención de datos del cliente y su plan contratado
    const cliente = await this.clienteRepo.findOne({
      where: { id_cliente: clienteId },
      relations: ['plan'],
    });

    if (!cliente) {
      throw new NotFoundException('Cliente no encontrado');
    }

    //Conteo de tickets de la empresa, equipos y sucursales en paralelo
    const [
      totalTickets,
      pendientes,
      enProgreso,
      cerrados,
      asignados,
      reabiertos,
      totalEquipos,
      totalSucursales,
    ] = await Promise.all([
      this.ticketRepo.count({ where: { id_cliente: clienteId } }),
      this.ticketRepo.count({
        where: { id_cliente: clienteId, estado: TicketStatus.PENDIENTE },
      }),
      this.ticketRepo.count({
        where: { id_cliente: clienteId, estado: TicketStatus.EN_PROGRESO },
      }),
      this.ticketRepo.count({
        where: { id_cliente: clienteId, estado: TicketStatus.CERRADO },
      }),
      this.ticketRepo.count({
        where: { id_cliente: clienteId, estado: TicketStatus.ASIGNADO },
      }),
      this.ticketRepo.count({
        where: { id_cliente: clienteId, estado: TicketStatus.REABIERTO },
      }),
      this.equipoRepo.count({
        where: { id_cliente: clienteId, is_active: true },
      }),
      this.sucursalRepo.count({
        where: { id_cliente: clienteId, is_active: true },
      }),
    ]);

    const abiertos = pendientes + asignados + enProgreso + reabiertos;
    const tasaResolucion =
      totalTickets > 0
        ? parseFloat(((cerrados / totalTickets) * 100).toFixed(2))
        : 0;

    //Cálculo de días restantes de vigencia del contrato y cuota de equipos utilizados
    const limiteEquipos =
      cliente.limite_equipos_contratado ||
      (cliente.plan ? cliente.plan.limite_equipos : 0) ||
      0;
    const porcentajeUsoEquipos =
      limiteEquipos > 0
        ? parseFloat(((totalEquipos / limiteEquipos) * 100).toFixed(2))
        : 0;

    let diasRestantesPlan: number | null = null;
    if (cliente.fecha_finalizacion_plan) {
      const fin = new Date(cliente.fecha_finalizacion_plan).getTime();
      const ahora = new Date().getTime();
      diasRestantesPlan = Math.max(
        0,
        Math.ceil((fin - ahora) / (1000 * 60 * 60 * 24)),
      );
    }

    //Agrupación y comparativa de tickets por cada sucursal de la empresa
    const ticketsPorSucursalRaw = await this.ticketRepo
      .createQueryBuilder('ticket')
      .innerJoin('ticket.equipo', 'equipo')
      .innerJoin('equipo.sucursal', 'sucursal')
      .where('ticket.id_cliente = :clienteId', { clienteId })
      .select('sucursal.id_sucursal', 'idSucursal')
      .addSelect('sucursal.nombre_sucursal', 'nombreSucursal')
      .addSelect('COUNT(ticket.id_ticket)', 'totalTickets')
      .addSelect(
        'SUM(CASE WHEN ticket.estado != :cerrado THEN 1 ELSE 0 END)',
        'abiertos',
      )
      .addSelect(
        'SUM(CASE WHEN ticket.estado = :cerrado THEN 1 ELSE 0 END)',
        'cerrados',
      )
      .groupBy('sucursal.id_sucursal')
      .addGroupBy('sucursal.nombre_sucursal')
      .setParameter('cerrado', TicketStatus.CERRADO)
      .getRawMany();

    //Próximas visitas técnicas programadas a las sucursales de la empresa
    const proximasVisitasRaw = await this.citasRepo
      .createQueryBuilder('cita')
      .innerJoinAndSelect('cita.sucursal', 'sucursal')
      .leftJoinAndSelect('cita.soporte_insitu', 'soporte')
      .leftJoinAndSelect('cita.tickets', 'tickets')
      .where('sucursal.id_cliente = :clienteId', { clienteId })
      .andWhere('cita.estado IN (:...estadosActivos)', {
        estadosActivos: [EstadoCita.PENDIENTE, EstadoCita.EN_CAMINO],
      })
      .orderBy('cita.fecha_programada', 'ASC')
      .take(5)
      .getMany();

    //Últimos tickets reportados por los trabajadores de la empresa (Top 5)
    const ultimosTicketsRaw = await this.ticketRepo
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.trabajador', 'trabajador')
      .leftJoinAndSelect('ticket.equipo', 'equipo')
      .leftJoinAndSelect('equipo.sucursal', 'sucursal')
      .where('ticket.id_cliente = :clienteId', { clienteId })
      .orderBy('ticket.created_at', 'DESC')
      .take(5)
      .getMany();

    //Retorno consolidado para el Administrador de la Empresa
    return {
      planContrato: {
        nombreEmpresa: cliente.nombre_principal,
        tipoCliente: cliente.tipo_cliente,
        plan: cliente.plan ? cliente.plan.tipo : 'Sin Plan',
        fechaInicio: cliente.fecha_inicio_plan,
        fechaFin: cliente.fecha_finalizacion_plan,
        diasRestantesPlan,
        costoNegociado: cliente.costo_negociado,
        limiteEquipos,
        equiposRegistrados: totalEquipos,
        porcentajeUsoEquipos,
        totalSucursales,
      },
      resumenTickets: {
        totalTickets,
        abiertos,
        pendientes,
        enProgreso,
        asignados,
        reabiertos,
        cerrados,
        tasaResolucion,
      },
      ticketsPorSucursal: ticketsPorSucursalRaw.map((s) => ({
        idSucursal: parseInt(s.idSucursal, 10),
        nombreSucursal: s.nombreSucursal,
        totalTickets: parseInt(s.totalTickets, 10),
        abiertos: parseInt(s.abiertos, 10) || 0,
        cerrados: parseInt(s.cerrados, 10) || 0,
      })),
      proximasVisitas: proximasVisitasRaw.map((v) => ({
        idCita: v.id_cita,
        fechaProgramada: v.fecha_programada,
        estado: v.estado,
        sucursal: v.sucursal ? v.sucursal.nombre_sucursal : 'N/A',
        soporte: v.soporte_insitu
          ? `${v.soporte_insitu.nombre} ${v.soporte_insitu.apellido}`
          : 'Por asignar',
        totalTickets: (v.tickets || []).length,
      })),
      ultimosTickets: ultimosTicketsRaw.map((t) => ({
        idTicket: t.id_ticket,
        pin: t.pin,
        asunto: t.asunto,
        estado: t.estado,
        sucursal:
          t.equipo && t.equipo.sucursal
            ? t.equipo.sucursal.nombre_sucursal
            : 'Principal',
        trabajador: t.trabajador
          ? `${t.trabajador.nombre} ${t.trabajador.apellido}`
          : 'Sin asignar',
        createdAt: t.created_at,
      })),
    };
  }

  // 5. DASHBOARD CLIENTE SUCURSAL (Panel Operativo para Encargado de Sede)
  async getClienteSucursalDashboard(user: JwtPayload) {
    //Validación de la sucursal asignada al usuario
    const sucursalId = user.sucursalId;
    if (!sucursalId) {
      throw new NotFoundException('Sucursal ID no encontrado en el usuario');
    }

    const sucursal = await this.sucursalRepo.findOne({
      where: { id_sucursal: sucursalId },
      relations: ['cliente'],
    });

    if (!sucursal) {
      throw new NotFoundException('Sucursal no encontrada');
    }

    //Conteo de equipos y trabajadores activos en la sucursal
    const [totalEquipos, totalTrabajadores] = await Promise.all([
      this.equipoRepo.count({
        where: { id_sucursal: sucursalId, is_active: true },
      }),
      this.usuarioRepo.count({
        where: { id_sucursal: sucursalId, is_active: true },
      }),
    ]);

    //Resumen agregado del estado de tickets de la sucursal
    const ticketsSucursalRaw = await this.ticketRepo
      .createQueryBuilder('ticket')
      .innerJoin('ticket.equipo', 'equipo')
      .where('equipo.id_sucursal = :sucursalId', { sucursalId })
      .select('COUNT(ticket.id_ticket)', 'total')
      .addSelect(
        'SUM(CASE WHEN ticket.estado = :pendiente THEN 1 ELSE 0 END)',
        'pendientes',
      )
      .addSelect(
        'SUM(CASE WHEN ticket.estado = :enProgreso THEN 1 ELSE 0 END)',
        'enProgreso',
      )
      .addSelect(
        'SUM(CASE WHEN ticket.estado = :asignado THEN 1 ELSE 0 END)',
        'asignados',
      )
      .addSelect(
        'SUM(CASE WHEN ticket.estado = :reabierto THEN 1 ELSE 0 END)',
        'reabiertos',
      )
      .addSelect(
        'SUM(CASE WHEN ticket.estado = :cerrado THEN 1 ELSE 0 END)',
        'cerrados',
      )
      .setParameter('pendiente', TicketStatus.PENDIENTE)
      .setParameter('enProgreso', TicketStatus.EN_PROGRESO)
      .setParameter('asignado', TicketStatus.ASIGNADO)
      .setParameter('reabierto', TicketStatus.REABIERTO)
      .setParameter('cerrado', TicketStatus.CERRADO)
      .getRawOne();

    const totalTickets = parseInt(ticketsSucursalRaw?.total || '0', 10);
    const pendientes = parseInt(ticketsSucursalRaw?.pendientes || '0', 10);
    const enProgreso = parseInt(ticketsSucursalRaw?.enProgreso || '0', 10);
    const asignados = parseInt(ticketsSucursalRaw?.asignados || '0', 10);
    const reabiertos = parseInt(ticketsSucursalRaw?.reabiertos || '0', 10);
    const cerrados = parseInt(ticketsSucursalRaw?.cerrados || '0', 10);
    const abiertos = pendientes + enProgreso + asignados + reabiertos;

    //Próxima visita técnica presencial agendada para esta sucursal específica
    const proximaVisita = await this.citasRepo.findOne({
      where: {
        sucursal: { id_sucursal: sucursalId },
        estado: In([EstadoCita.PENDIENTE, EstadoCita.EN_CAMINO]),
      },
      relations: ['soporte_insitu', 'tickets'],
      order: { fecha_programada: 'ASC' },
    });

    //Desglose de incidencias agrupadas por área de la sucursal
    const ticketsPorAreaRaw = await this.ticketRepo
      .createQueryBuilder('ticket')
      .innerJoin('ticket.equipo', 'equipo')
      .where('equipo.id_sucursal = :sucursalId', { sucursalId })
      .select('COALESCE(equipo.area, \'General\')', 'nombreArea')
      .addSelect('COUNT(ticket.id_ticket)', 'total')
      .addSelect(
        'SUM(CASE WHEN ticket.estado != :cerrado THEN 1 ELSE 0 END)',
        'abiertos',
      )
      .groupBy('equipo.area')
      .setParameter('cerrado', TicketStatus.CERRADO)
      .getRawMany();

    //Listado de tickets recientes creados en la sucursal (Top 10)
    const ticketsRecientesRaw = await this.ticketRepo
      .createQueryBuilder('ticket')
      .innerJoinAndSelect('ticket.equipo', 'equipo')
      .leftJoinAndSelect('ticket.trabajador', 'trabajador')
      .where('equipo.id_sucursal = :sucursalId', { sucursalId })
      .orderBy('ticket.created_at', 'DESC')
      .take(10)
      .getMany();

    //Retorno consolidado para el Encargado de Sucursal
    return {
      sucursal: {
        idSucursal: sucursal.id_sucursal,
        nombreSucursal: sucursal.nombre_sucursal,
        encargado: sucursal.encargado,
        empresa: sucursal.cliente ? sucursal.cliente.nombre_principal : 'N/A',
        totalEquipos,
        totalTrabajadores,
      },
      resumenTickets: {
        totalTickets,
        abiertos,
        pendientes,
        enProgreso,
        asignados,
        reabiertos,
        cerrados,
      },
      proximaVisita: proximaVisita
        ? {
            idCita: proximaVisita.id_cita,
            fechaProgramada: proximaVisita.fecha_programada,
            estado: proximaVisita.estado,
            observaciones: proximaVisita.observaciones,
            soporte: proximaVisita.soporte_insitu
              ? `${proximaVisita.soporte_insitu.nombre} ${proximaVisita.soporte_insitu.apellido}`
              : 'Por asignar',
            telefonoSoporte: proximaVisita.soporte_insitu
              ? proximaVisita.soporte_insitu.telefono
              : null,
            totalTickets: (proximaVisita.tickets || []).length,
          }
        : null,
      ticketsPorArea: ticketsPorAreaRaw.map((a) => ({
        area: a.nombreArea,
        total: parseInt(a.total, 10),
        abiertos: parseInt(a.abiertos, 10) || 0,
      })),
      ticketsRecientes: ticketsRecientesRaw.map((t) => ({
        idTicket: t.id_ticket,
        pin: t.pin,
        asunto: t.asunto,
        estado: t.estado,
        area: t.equipo ? t.equipo.area : 'General',
        equipo: t.equipo ? `${t.equipo.tipo} (${t.equipo.marca})` : 'N/A',
        trabajador: t.trabajador
          ? `${t.trabajador.nombre} ${t.trabajador.apellido}`
          : 'Sin asignar',
        createdAt: t.created_at,
      })),
    };
  }

  // 6. DASHBOARD CLIENTE TRABAJADOR 
  async getClienteTrabajadorDashboard(user: JwtPayload) {
    const trabajadorId = user.userId;

    //Conteo de tickets personales creados por el trabajador
    const [
      misTicketsTotal,
      misTicketsCerrados,
      misTicketsPendientes,
      misTicketsEnProgreso,
      misTicketsAsignados,
      misTicketsReabiertos,
    ] = await Promise.all([
      this.ticketRepo.count({ where: { id_trabajador: trabajadorId } }),
      this.ticketRepo.count({
        where: {
          id_trabajador: trabajadorId,
          estado: TicketStatus.CERRADO,
        },
      }),
      this.ticketRepo.count({
        where: {
          id_trabajador: trabajadorId,
          estado: TicketStatus.PENDIENTE,
        },
      }),
      this.ticketRepo.count({
        where: {
          id_trabajador: trabajadorId,
          estado: TicketStatus.EN_PROGRESO,
        },
      }),
      this.ticketRepo.count({
        where: {
          id_trabajador: trabajadorId,
          estado: TicketStatus.ASIGNADO,
        },
      }),
      this.ticketRepo.count({
        where: {
          id_trabajador: trabajadorId,
          estado: TicketStatus.REABIERTO,
        },
      }),
    ]);

    const misTicketsAbiertos =
      misTicketsPendientes +
      misTicketsEnProgreso +
      misTicketsAsignados +
      misTicketsReabiertos;

    //Búsqueda del ticket activo en curso para el indicador en vivo (Stepper de progreso)
    const ticketEnAtencion = await this.ticketRepo.findOne({
      where: {
        id_trabajador: trabajadorId,
        estado: In([
          TicketStatus.REABIERTO,
          TicketStatus.EN_PROGRESO,
          TicketStatus.ASIGNADO,
          TicketStatus.PENDIENTE,
        ]),
      },
      relations: ['soporte', 'equipo'],
      order: { updated_at: 'DESC' },
    });

    //Listado de equipos de cómputo asignados a este trabajador con software instalado
    const misEquipos = await this.equipoRepo.find({
      where: { id_trabajador: trabajadorId, is_active: true },
      relations: ['software_instalado', 'software_instalado.soft'],
    });

    //Historial reciente de solicitudes reportadas por el trabajador (Top 5)
    const historialTickets = await this.ticketRepo.find({
      where: { id_trabajador: trabajadorId },
      order: { created_at: 'DESC' },
      take: 5,
    });

    //Retorno consolidado para el Usuario Final / Trabajador
    return {
      resumen: {
        misTicketsTotal,
        misTicketsAbiertos,
        misTicketsPendientes,
        misTicketsEnProgreso,
        misTicketsAsignados,
        misTicketsReabiertos,
        misTicketsCerrados,
        misEquiposRegistrados: misEquipos.length,
      },
      ticketEnAtencion: ticketEnAtencion
        ? {
            idTicket: ticketEnAtencion.id_ticket,
            pin: ticketEnAtencion.pin,
            asunto: ticketEnAtencion.asunto,
            detalle: ticketEnAtencion.detalle,
            estado: ticketEnAtencion.estado,
            esSoftware: ticketEnAtencion.es_software,
            equipo: ticketEnAtencion.equipo
              ? `${ticketEnAtencion.equipo.tipo} (${ticketEnAtencion.equipo.marca})`
              : 'N/A',
            soporte: ticketEnAtencion.soporte
              ? `${ticketEnAtencion.soporte.nombre} ${ticketEnAtencion.soporte.apellido}`
              : 'Pendiente de asignación',
            createdAt: ticketEnAtencion.created_at,
          }
        : null,
      misEquipos: misEquipos.map((e) => ({
        idEquipo: e.id_equipo,
        tipo: e.tipo,
        marca: e.marca,
        numeroSerie: e.numero_serie,
        area: e.area,
        ultimaRevision: e.ultRevision,
        proximaRevision: e.revProgramada,
        softwareInstalado: (e.software_instalado || [])
          .map((s) => s.soft?.nombre_software)
          .filter(Boolean),
      })),
      historialTickets: historialTickets.map((t) => ({
        idTicket: t.id_ticket,
        pin: t.pin,
        asunto: t.asunto,
        estado: t.estado,
        createdAt: t.created_at,
      })),
    };
  }
}