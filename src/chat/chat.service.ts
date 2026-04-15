//Helpdesk-app/src/chat/chat.service.ts
//Modulo de servicio para el chat
//Se encargara de la logica del chat entre el cliente y el soporte tecnico
//Importaciones necesarias:
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Redis from 'ioredis';
import { MensajeDto } from './dto/mensaje.dto';
import { Mensaje, MensajeDocument } from './schema/mensaje.schema';
import { InjectRedis } from '@nestjs-modules/ioredis';

@Injectable()
export class ChatService {
    private readonly logger = new Logger(ChatService.name);
    constructor(
        @InjectModel(Mensaje.name) private mensajeModel: Model<MensajeDocument>,
        @InjectRedis() private readonly redis: Redis
    ){}
    
    //Metodo para guardar un mensaje individual en la base de datos
    async guardarMensaje(mensajeDTO: MensajeDto): Promise<Mensaje> {
        //Guardar el mensaje en MongoDB
        const mensaje = new this.mensajeModel(mensajeDTO);
        const savedMensaje = await mensaje.save();

        //Guardar el mensaje en Redis (para acceso rápido)
        try{
            //Usamos una lista en Redis para almacenar los mensajes de cada ticket
            const redisKey = `ticket:${mensajeDTO.ticketId}:mensajes`;
            await this.redis.rpush(redisKey, JSON.stringify(mensajeDTO));
            await this.redis.ltrim(redisKey, -100, -1); // Mantener solo los últimos 100 mensajes en Redis
            await this.redis.expire(redisKey, 60 * 60 * 24); // Expirar después de 24 horas
        } catch (error) {
            this.logger.error(`Error al guardar en Redis: ${error instanceof Error ? error.message : String(error)}`);
        }
        return savedMensaje;
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
        const redisKey = `ticket:${ticketId}:mensajes`;
        
        //Obtener el historial reciente de Redis (últimos 100 mensajes)
        const mensajesRedisString = await this.redis.lrange(redisKey, 0, -1);

        if(mensajesRedisString && mensajesRedisString.length > 0){
            const mensajesRedis = mensajesRedisString.map(msg => JSON.parse(msg));
            return mensajesRedis; // Si hay mensajes en Redis, los devolvemos directamente (asumiendo que Redis tiene el historial completo)
        }

        //Si Redis esta vacio o no tiene mensajes, obtenemos todo el historial de MongoDB
        this.logger.log(`Cache vacia para ticket ${ticketId}, obteniendo historial completo de MongoDB`);
        //Obtener mensajes de MongoDB
        const mensajesMongo = await this.mensajeModel.find({ ticketId }).sort({ createdAt: 1 }).lean().exec();
        if (mensajesMongo.length > 0) {
            const stringifiedMessages = mensajesMongo.map(msg => JSON.stringify(msg));
            await this.redis.rpush(redisKey, ...stringifiedMessages);
            await this.redis.expire(redisKey, 86400);
        }   
        //Ordenar los mensajes combinados por fecha de creación ascendente
        
        return mensajesMongo;
    }
}
