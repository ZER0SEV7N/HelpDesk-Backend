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

    //Guardar mensaje masivamente
    async guardarMensajesMasivo(mensajes: any[]): Promise<MensajeDocument[]> {
        const resultado = await this.mensajeModel.insertMany(mensajes);
        return resultado as MensajeDocument[];
    }

    //Obtener el historial de mensajes de un ticket
    async obtenerHistorial(ticketId: number): Promise<Mensaje[]> {
        return await this.mensajeModel.find({ ticketId}).sort({ createdAt: 1 }).exec(); //Ordenar por fecha de creación ascendente
    }

    //Obtener el historial completo (todos los mensajes) de un ticket 
    //Mongo + Redisç
    async obtenerHistorialCompleto(ticketId: number){
        //Obtener mensajes de MongoDB
        const mensajesMongo = await this.mensajeModel.find({ ticketId }).sort({ createdAt: 1 }).exec();

        //Obtener mensajes de Redis
        const redisKey = `ticket:${ticketId}:mensajes`;
        const mensajesRedisString = await this.redis.lrange(redisKey, 0, -1);

        //Parsear los mensajes de Redis
        const mensajesRedis = mensajesRedisString.map(msg => JSON.parse(msg));

        //Combinar los mensajes de MongoDB y Redis
        const mensajesCombinados = [...mensajesMongo, ...mensajesRedis];
        //Ordenar los mensajes combinados por fecha de creación ascendente
        mensajesCombinados.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        return mensajesCombinados;
    }
}
