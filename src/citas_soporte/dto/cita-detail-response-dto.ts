// --- DTOs de Apoyo para Ticket ---

export class ClienteResumenDto {
  id_cliente: number;
}

export class EquipoResumenDto {
  id_equipo: number;
}

export class UsuarioResumenDto {
  id_usuario: number;
  nombre_completo: string;
  correo: string;
  telefono: string;
}

export class AreaTicketResumenDto {
  nombre_area: string;
}

export class TicketDetalleDto {
  id_ticket: number;
  pin: string;
  asunto: string;
  detalle: string;
  estado: string;
  es_software: boolean;
  imagen_url: string | null;
  id_software: number | null;
  id_equipo: number | null;
  id_cliente: number | null;
  id_trabajador: number | null;
  id_soporte: number | null;
  created_at: Date;
  updated_at: Date;

  cliente?: ClienteResumenDto | null;
  equipo?: EquipoResumenDto | null;
  trabajador?: UsuarioResumenDto | null;
  soporte?: UsuarioResumenDto | null;
  area?: AreaTicketResumenDto | null;
}

// --- DTOs de Apoyo para Cita ---

export class SucursalDetalleDto {
  id_sucursal: number;
  nombre_sucursal: string;
  encargado: string;
  telefono: string;
  correo: string;
  direccion: string;
  id_cliente: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export class SoporteInsituDetalleDto {
  id_usuario: number;
  nombre: string;
  apellido: string;
  nombre_completo: string;
  correo: string;
  telefono: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// --- DTO Principal ---

export class CitaDetailResponseDto {
  id_cita: number;
  fecha_programada: Date;
  estado: string;
  observaciones: string | null;
  created_at: Date;
  updated_at: Date;
  sucursal: SucursalDetalleDto;
  soporte_insitu: SoporteInsituDetalleDto;
  tickets: TicketDetalleDto[];

  static init(entity: any): CitaDetailResponseDto {
    const dto = new CitaDetailResponseDto();

    dto.id_cita = entity.id_cita;
    dto.fecha_programada = entity.fecha_programada;
    dto.estado = entity.estado;
    dto.observaciones = entity.observaciones ?? null;
    dto.created_at = entity.created_at;
    dto.updated_at = entity.updated_at;

    // Mapeo de Sucursal
    dto.sucursal = {
      id_sucursal: entity.sucursal?.id_sucursal,
      nombre_sucursal: entity.sucursal?.nombre_sucursal,
      encargado: entity.sucursal?.encargado,
      telefono: entity.sucursal?.telefono,
      correo: entity.sucursal?.correo,
      direccion: entity.sucursal?.direccion,
      id_cliente: entity.sucursal?.id_cliente,
      is_active: entity.sucursal?.is_active,
      created_at: entity.sucursal?.created_at,
      updated_at: entity.sucursal?.updated_at,
    };

    // Mapeo de Soporte
    dto.soporte_insitu = {
      id_usuario: entity.soporte_insitu?.id_usuario,
      nombre: entity.soporte_insitu?.nombre,
      apellido: entity.soporte_insitu?.apellido,
      nombre_completo:
        `${entity.soporte_insitu?.nombre || ''} ${entity.soporte_insitu?.apellido || ''}`.trim(),
      correo: entity.soporte_insitu?.correo,
      telefono: entity.soporte_insitu?.telefono,
      is_active: entity.soporte_insitu?.is_active,
      created_at: entity.soporte_insitu?.created_at,
      updated_at: entity.soporte_insitu?.updated_at,
    };

    // Fallback para mapear la colección en plural o singular (entity.tickets || entity.ticket)
    const ticketsSource = entity.tickets || entity.ticket || [];

    dto.tickets = Array.isArray(ticketsSource)
      ? ticketsSource.map((t: any) => ({
          id_ticket: t.id_tickets ?? t.id_ticket, // Contempla la PK id_tickets de la imagen
          pin: t.pin,
          asunto: t.asunto,
          detalle: t.detalle,
          estado: t.estado,
          es_software: Boolean(t.es_software),
          imagen_url: t.imagen_url ?? null,
          id_software: t.id_software ?? null,
          id_equipo: t.id_equipo ?? null,
          id_cliente: t.id_cliente ?? null,
          id_trabajador: t.id_trabajador ?? null,
          id_soporte: t.id_soporte ?? null,
          created_at: t.created_at,
          updated_at: t.updated_at,

          ...(t.trabajador?.area && {
            area: {
              nombre_area: t.trabajador.area.nombre_area,
            },
          }),
          ...(t.trabajador && {
            trabajador: {
              id_usuario: t.trabajador.id_usuario,
              nombre_completo:
                `${t.trabajador.nombre || ''} ${t.trabajador.apellido || ''}`.trim(),
              correo: t.trabajador.correo,
              telefono: t.trabajador.telefono,
            },
          }),
          ...(t.soporte && {
            soporte: {
              id_usuario: t.soporte.id_usuario,
              nombre_completo:
                `${t.soporte.nombre || ''} ${t.soporte.apellido || ''}`.trim(),
              correo: t.soporte.correo,
              telefono: t.soporte.telefono,
            },
          }),
        }))
      : [];

    return dto;
  }

  static initList(entities: any[]): CitaDetailResponseDto[] {
    return entities.map((entity) => CitaDetailResponseDto.init(entity));
  }
}
