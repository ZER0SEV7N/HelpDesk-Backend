import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ClientesModule } from './clientes/clientes.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { HardwareModule } from './hardware/hardware.module';
import { TicketModule } from './ticket/ticket.module';
import { EquiposModule } from './equipos/equipos.module';
import { ChatModule } from './common/chat/chat.module';
import { UsuarioModule } from './modules/usuario/usuario.module';
import { PlanesModule } from './planes/planes.module';
import { SoftwareModule } from './software/software.module';
import { DashboardsModule } from './dashboards/dashboards.module';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { EmailModule } from './common/email/email.module';
import { CitasModule } from './citas_soporte/citas.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    ClientesModule,
    AuthModule,
    HardwareModule,
    TicketModule,
    SoftwareModule,
    EquiposModule,
    ChatModule,
    UsuarioModule,
    EmailModule,
    PlanesModule,
    CitasModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'), // Carpeta donde se almacenan los archivos subidos
      serveRoot: '/uploads', // Ruta base para acceder a los archivos (ejemplo: http://localhost:3000/uploads/archivo.jpg)
    }),
  ],

  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
