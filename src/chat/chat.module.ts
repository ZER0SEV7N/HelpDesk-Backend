import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway'; // 1. Importa tu Gateway
import { MongooseModule } from '@nestjs/mongoose';
import { Mensaje, MensajeSchema } from './schema/mensaje.schema';
import { AuthModule } from '../auth/auth.module'; // 2. Para validar JWT
import { TicketModule } from '../ticket/ticket.module'; // 3. El módulo de tus compañeros
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from '../entities/Usuario.entity'; // 4. Para la búsqueda de técnicos

@Module({
    imports: [
        // Mantienes Mongoose para el historial de mensajes (muy inteligente para escalabilidad)
        MongooseModule.forFeature([{ name: Mensaje.name, schema: MensajeSchema }]),
        
        // Importas TypeORM para que el Gateway pueda consultar la carga de los técnicos
        TypeOrmModule.forFeature([Usuario]), 
        
        // Importas los módulos externos necesarios
        AuthModule,
        TicketModule,
    ],
    providers: [
        ChatService, 
        ChatGateway // 5. Registras el Gateway aquí para que NestJS lo active
    ],
    exports: [ChatService],
})
export class ChatModule {}