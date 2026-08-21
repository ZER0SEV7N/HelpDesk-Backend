import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway'; // 1. Importa tu Gateway
import { MongooseModule } from '@nestjs/mongoose';
import { Mensaje, MensajeSchema } from './schema/mensaje.schema';
import { AuthModule } from '../../modules/auth/auth.module';
import { TicketModule } from '../../ticket/ticket.module';
import { Usuario } from '../../entities/Usuario.entity'; // 2. Importa la entidad de Usuario para consultar la carga de los técnicos
import { Tickets } from '../../entities/Tickets.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from '@/database/database.module';
import { ChatController } from './chat.controller';
@Module({
  imports: [
    //Mantienes Mongoose para el historial de mensajes (muy inteligente para escalabilidad)
    MongooseModule.forFeature([{ name: Mensaje.name, schema: MensajeSchema }]),
    //Importas TypeORM para que el Gateway pueda consultar la carga de los técnicos
    TypeOrmModule.forFeature([Usuario, Tickets]),
    //Importas los módulos externos necesarios
    DatabaseModule,
    AuthModule,
    TicketModule,
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
  exports: [ChatService, ChatGateway],
})
export class ChatModule {}
