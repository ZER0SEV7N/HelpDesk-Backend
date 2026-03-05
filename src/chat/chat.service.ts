//Helpdesk-app/src/chat/chat.service.ts
//Modulo de servicio para el chat
//Se encargara de la logica del chat entre el cliente y el soporte tecnico
//Importaciones necesarias:
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MensajeDto } from './dto/mensaje.dto';
import { Mensaje, MensajeDocument } from './schema/mensaje.schema';

@Injectable()
export class ChatService {
    constructor(
        @InjectModel(Mensaje.name) private mensajeModel: Model<MensajeDocument>,
    ){}
    
    //Metodo para guardar un mensaje individual en la base de datos
    async guardarMensaje(mensajeDTO: MensajeDto): Promise<Mensaje> {
        const mensaje = new this.mensajeModel(mensajeDTO);
        return await mensaje.save();
    }

    async guardarMensajesMasivo(mensajes: MensajeDto[]): Promise<Mensaje[]> {
        const docs = await this.mensajeModel.insertMany(mensajes);
        return docs as unknown as Mensaje[];
    }

    async obtenerHistorial(ticketId: string): Promise<Mensaje[]> {
        return await this.mensajeModel.find({ ticketId }).sort({ createdAt: 1 }).exec();
    }
}
