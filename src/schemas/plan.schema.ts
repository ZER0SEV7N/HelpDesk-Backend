import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PlanDocument = Plan & Document;

@Schema({ collection: 'planes' })
export class Plan {
  @Prop({ required: true })
  numero_plan: number;

  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true })
  descripcion: string;

  @Prop({ required: true, default: 0 })
  precio: number;
}

export const PlanSchema = SchemaFactory.createForClass(Plan);
