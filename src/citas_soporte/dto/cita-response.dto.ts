// DTO de resumen del Ticket extendido
export class TicketResumenDto {
  id_ticket: number;
  pin: string;
  asunto: string;
  detalle: string;
  estado: string;
  created_at?: Date;
}

export class SucursalResumenDto {
  id_sucursal: number;
  nombre_sucursal: string;
  direccion: string;
}

export class AreaResumenDto {
  id_area: number;
  nombre_area: string;
}

export class SoporteResumenDto {
  id_usuario: number;
  nombre_completo: string;
  correo: string;
  telefono: string;
}

export class CitaResponseDto {
  id_cita: number;
  fecha_programada: Date;
  estado: string;
  observaciones: string | null;
  created_at: Date;
  updated_at: Date;
  sucursal: SucursalResumenDto;
  area: AreaResumenDto;
  soporte_insitu: SoporteResumenDto;
  tickets: TicketResumenDto[];

  static init(entity: any): CitaResponseDto {
    const dto = new CitaResponseDto();

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
      direccion: entity.sucursal?.direccion,
    };

    // Mapeo de Área
    dto.area = {
      id_area: entity.area?.id_area,
      nombre_area: entity.area?.nombre_area,
    };

    // Mapeo de Soporte
    dto.soporte_insitu = {
      id_usuario: entity.soporte_insitu?.id_usuario,
      nombre_completo:
        `${entity.soporte_insitu?.nombre || ''} ${entity.soporte_insitu?.apellido || ''}`.trim(),
      correo: entity.soporte_insitu?.correo,
      telefono: entity.soporte_insitu?.telefono,
    };

    // FIX: Evaluamos entity.tickets (plural) o en su defecto entity.ticket (fallback)
    const ticketsSource = entity.tickets || entity.ticket || [];

    dto.tickets = Array.isArray(ticketsSource)
      ? ticketsSource.map((t: any) => ({
          id_ticket: t.id_ticket,
          pin: t.pin,
          asunto: t.asunto,
          detalle: t.detalle,
          estado: t.estado,
          created_at: t.created_at,
        }))
      : [];

    return dto;
  }

  static initList(entities: any[]): CitaResponseDto[] {
    return entities.map((entity) => CitaResponseDto.init(entity));
  }
}
