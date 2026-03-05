// Base de datos: MongoDB (datos principales) + Redis (chat en tiempo real)
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisModule } from '@nestjs-modules/ioredis';

@Module({
  imports: [
    // MongoDB: tickets, usuarios, roles, planes, clientes, hardware, equipos, chat
    MongooseModule.forRoot('mongodb://localhost:27017/helpdesk'),
    // Redis: chat en tiempo real (mensajes en memoria, aún en desarrollo)
    RedisModule.forRoot({
      type: 'single',
      url: 'redis://localhost:6379',
    }),
  ],
})
export class DatabaseModule {}
