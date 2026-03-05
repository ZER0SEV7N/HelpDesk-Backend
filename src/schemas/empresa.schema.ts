import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EmpresaDocument = Empresa & Document;

@Schema({ collection: 'empresas' })
export class Empresa {
  @Prop({ required: true })
  nombre_cliente: string;

  @Prop({ required: true, length: 11 })
  ruc: string;

  @Prop({ required: true })
  direccion: string;

  @Prop({ required: true })
  telefono: string;

  @Prop({ required: true })
  correo: string;
}

export const EmpresaSchema = SchemaFactory.createForClass(Empresa);
