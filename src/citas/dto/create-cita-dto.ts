export class CreateCitaDto {
  ticket_ids: number[]; // Puede ser un array vacio
  id_soporte: number; // No puede ser nulo, ya que se asignará un soporte automáticamente
  id_sucursal: number; // No puede ser nulo, ya que se asignará una sucursal automáticamente
  id_area: number; // No puede ser nulo, ya que se asignará un área automáticamente
  motivo: string; // Puede ser nulo, ya que se asignará un motivo automáticamente y si se manda se concatenara
  fecha_programada: Date; // No puede ser nulo, ya que se asignará una fecha automáticamente
}
