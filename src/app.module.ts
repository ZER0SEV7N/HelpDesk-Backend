import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ClientesModule } from './clientes/clientes.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { HardwareModule } from './equipos/hardware/hardware.module';
import { TicketModule } from './ticket/ticket.module';
import { EquiposModule } from './equipos/equipos.module';
import { ChatGateway } from './chat/chat.gateway';
import { ChatService } from './chat/chat.service';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [ConfigModule.forRoot({
      isGlobal: true}),
      DatabaseModule, ClientesModule, AuthModule, UserModule, HardwareModule, TicketModule, EquiposModule, ChatModule, ],
  controllers: [AppController],
  providers: [AppService, ChatGateway, ChatService],
})
export class AppModule {}
