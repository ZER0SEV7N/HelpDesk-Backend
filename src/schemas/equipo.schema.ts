import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EquipoDocument = Equipo & Document;

@Schema({ collection: 'equipos' })
export class Equipo {
  @Prop({ required: true })
  tipo: string;

  @Prop({ required: true })
  marca: string;

  @Prop({ required: true })
  numero_serie: string;

  @Prop({ required: true })
  nombre_usuario: string;

  @Prop({ required: true })
  area: string;

  @Prop()
  ultRevision: Date;

  @Prop()
  revProgramada: Date;

  @Prop({ type: Types.ObjectId, ref: 'Empresa' })
  empresa: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Plan' })
  plan: Types.ObjectId;
}

export const EquipoSchema = SchemaFactory.createForClass(Equipo);
