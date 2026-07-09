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
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async guardarMensaje(mensajeDTO: MensajeDto): Promise<unknown> {
    const mensaje = new this.mensajeModel(mensajeDTO);
    const savedMensaje = await mensaje.save();

    try {
      const redisKey = `ticket:${mensajeDTO.ticketId}:mensajes`;
      await this.redis.rpush(
        redisKey,
        JSON.stringify({ ...mensajeDTO, createdAt: new Date() }),
      );
      await this.redis.ltrim(redisKey, -100, -1);
      await this.redis.expire(redisKey, 60 * 60 * 24);
    } catch (error) {
      this.logger.error(
        `Error al guardar en Redis: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
    return savedMensaje;
  }

  async guardarMensajesMasivo(mensajes: unknown[]): Promise<unknown[]> {
    const resultado = await this.mensajeModel.insertMany(mensajes);
    return resultado as unknown[];
  }

  async obtenerHistorial(ticketId: number): Promise<unknown[]> {
    return await this.mensajeModel
      .find({ ticketId })
      .sort({ createdAt: 1 })
      .exec();
  }

  async obtenerHistorialCompleto(ticketId: number): Promise<unknown[]> {
    const redisKey = `ticket:${ticketId}:mensajes`;

    const mensajesRedisString = await this.redis.lrange(redisKey, 0, -1);

    if (mensajesRedisString && mensajesRedisString.length > 0) {
      return mensajesRedisString.map((msg) => JSON.parse(msg));
    }

    this.logger.log(
      `Cache vacia para ticket ${ticketId}, obteniendo historial completo de MongoDB`,
    );
    const mensajesMongo = await this.mensajeModel
      .find({ ticketId })
      .sort({ createdAt: 1 })
      .lean()
      .exec();
    if (mensajesMongo.length > 0) {
      const stringifiedMessages = mensajesMongo.map((msg) =>
        JSON.stringify(msg),
      );
      await this.redis.rpush(redisKey, ...stringifiedMessages);
      await this.redis.expire(redisKey, 86400);
    }

    return mensajesMongo;
  }
}
