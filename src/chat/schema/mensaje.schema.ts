//Helpdesk-app/src/chat/schema/mensaje.schema.ts
//Modulo de esquema para la coleccion de mensajes del chat
//Se utilizara la base de datos MongoDB para almacenar el historial del chat entre el cliente y el soporte tecnico
//Importaciones necesarias:
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
export type MensajeDocument = Mensaje & Document;

@Schema({timestamps: true}) //Agrega campos de createdAt y updatedAt automaticamente
export class Mensaje {
    @Prop({ required: true, index: true })
    ticketId: string; // MongoDB ObjectId del ticket (string)

    @Prop({ required: true })
    userId: string; // MongoDB ObjectId del usuario (string)

    //Contenido del mensaje
    @Prop({ required: true })
    contenido: string;

    //Si se envian archivos no menor a 20mb, 
    //se puede agregar un campo para almacenar la URL del archivo en un servicio de almacenamiento externo (ejemplo: AWS S3, Cloudinary, etc.)
    @Prop()
    urlArchivo?: string;
}

export const MensajeSchema = SchemaFactory.createForClass(Mensaje);