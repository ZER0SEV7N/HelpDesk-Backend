import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ClientesModule } from './clientes/clientes.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { HardwareModule } from './equipos/hardware/hardware.module';
import { TicketModule } from './ticket/ticket.module';
import { EquiposModule } from './equipos/equipos.module';
import { ChatModule } from './chat/chat.module';
import { UsuarioModule } from './usuario/usuario.module';
import { PlanesModule } from './planes/planes.module';
import { SoftwareModule } from './equipos/software/software.module';

@Module({
  imports: [ConfigModule.forRoot({
      isGlobal: true}),
      DatabaseModule, 
      ClientesModule, 
      AuthModule, 
      HardwareModule, 
      TicketModule,
      SoftwareModule, 
      EquiposModule, 
      ChatModule, 
      UsuarioModule, 
      PlanesModule,
    ],
    
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}