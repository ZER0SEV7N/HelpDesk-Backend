import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HardwareDocument = Hardware & Document;

@Schema({ collection: 'hardware' })
export class Hardware {
  @Prop({ required: true })
  tipo_equipo: string;

  @Prop({ required: true })
  numero_serie: string;

  @Prop({ required: true })
  fecha_compra: Date;

  @Prop({ default: '' })
  plan: string;

  @Prop({ required: true })
  marca: string;

  @Prop({ required: true })
  proveedor: string;

  @Prop({ required: true })
  descripcion: string;

  @Prop()
  ult_revision: Date;

  @Prop()
  rev_programada: Date;
}

export const HardwareSchema = SchemaFactory.createForClass(Hardware);
