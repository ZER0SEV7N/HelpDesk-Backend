import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway'; // 1. Importa tu Gateway
import { MongooseModule } from '@nestjs/mongoose';
import { Mensaje, MensajeSchema } from './schema/mensaje.schema';
import { AuthModule } from '../auth/auth.module';
import { TicketModule } from '../ticket/ticket.module';
import { Usuario } from '../entities/Usuario.entity'; // 2. Importa la entidad de Usuario para consultar la carga de los técnicos
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from 'src/database/database.module';
@Module({
    imports: [
        //Mantienes Mongoose para el historial de mensajes (muy inteligente para escalabilidad)
        MongooseModule.forFeature([{ name: Mensaje.name, schema: MensajeSchema }]),
        //Importas TypeORM para que el Gateway pueda consultar la carga de los técnicos
        TypeOrmModule.forFeature([Usuario]), 
        //Importas los módulos externos necesarios
        DatabaseModule,
        AuthModule,
        TicketModule,
    ],
    providers: [ChatService, ChatGateway],
    exports: [ChatService],
})
export class ChatModule {}