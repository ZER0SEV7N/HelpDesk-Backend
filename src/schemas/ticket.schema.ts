import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export const TicketStatus = {
  PENDIENTE: 'Pendiente',
  ASIGNADO: 'Asignado',
  EN_PROGRESO: 'En Progreso',
  RESUELTO: 'Resuelto',
  REABIERTO: 'Reabierto',
  CERRADO: 'Cerrado',
} as const;

export type TicketDocument = Ticket & Document;

@Schema({ collection: 'tickets', timestamps: { createdAt: 'fecha_creacion' } })
export class Ticket {
  @Prop({ required: true, unique: true, length: 6 })
  pin: string;

  @Prop({ required: true })
  asunto: string;

  @Prop({ required: true })
  detalle: string;

  @Prop({ default: TicketStatus.PENDIENTE })
  estado: string;

  @Prop({ type: Types.ObjectId, ref: 'Equipo', required: true })
  id_equipo: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  id_cliente: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  id_soporte: Types.ObjectId;

  @Prop()
  id_software: number;

  @Prop({ default: false })
  es_software: boolean;

  @Prop()
  imagen_url: string;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);
