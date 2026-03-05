import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RolDocument = Rol & Document;

@Schema({ collection: 'roles' })
export class Rol {
  @Prop({ required: true, unique: true })
  nombre: string;
}

export const RolSchema = SchemaFactory.createForClass(Rol);
