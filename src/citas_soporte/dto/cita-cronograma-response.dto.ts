export class CitaCronogramaResponseDto {
  id_cita: number;
  fecha_programada: Date;
  estado: string;
  id_cliente: number;
  nombre_cliente: string;
  id_sucursal: number;
  nombre_sucursal: string;

  static init(entity: any): CitaCronogramaResponseDto {
    const dto = new CitaCronogramaResponseDto();

    dto.id_cita = entity.id_cita;
    dto.fecha_programada = entity.fecha_programada;
    dto.estado = entity.estado;
    dto.id_cliente = entity.sucursal?.cliente?.id_cliente;
    dto.nombre_cliente = entity.sucursal?.cliente?.nombre_principal;
    dto.id_sucursal = entity.sucursal?.id_sucursal;
    dto.nombre_sucursal = entity.sucursal?.nombre_sucursal;

    return dto;
  }

  static initList(entities: any[]): CitaCronogramaResponseDto[] {
    return entities.map((entity) => CitaCronogramaResponseDto.init(entity));
  }
}
