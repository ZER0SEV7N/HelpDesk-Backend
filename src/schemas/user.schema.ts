import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ collection: 'usuarios' })
export class User {
  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true })
  apellido: string;

  @Prop({ required: true, unique: true })
  correo: string;

  @Prop({ required: true, select: false })
  contrasena: string;

  @Prop({ required: true })
  telefono: string;

  @Prop({ default: true })
  is_active: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Rol', required: true })
  rol: Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);
