///Helpdesk-app/src/chat/chat.module.ts
//Modulo del chat
//Se encargara de manejar la logica del chat entre el cliente y el soporte tecnico
import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Mensaje, MensajeSchema } from './schema/mensaje.schema';
@Module({
    imports: [
        MongooseModule.forFeature([{ name: Mensaje.name, schema: MensajeSchema }]),
    ],
    providers: [ChatService],
    exports: [ChatService],
})
export class ChatModule {}
