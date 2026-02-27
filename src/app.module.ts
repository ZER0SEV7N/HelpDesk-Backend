import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ClientesModule } from './clientes/clientes.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { HardwareModule } from './hardware/hardware.module';
import { TicketModule } from './ticket/ticket.module';
import { ChatGateway } from './chat/chat.gateway';

@Module({
  imports: [ConfigModule.forRoot({
      isGlobal: true}),
      DatabaseModule, ClientesModule, AuthModule, UserModule, HardwareModule, TicketModule, ],
  controllers: [AppController],
  providers: [AppService, ChatGateway],
})
export class AppModule {}
