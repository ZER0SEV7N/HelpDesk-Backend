import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ClientesModule } from './clientes/clientes.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { HardwareModule } from './hardware/hardware.module';
import { TicketModule } from './ticket/ticket.module';
import { EquiposModule } from './equipos/equipos.module';
import { ChatModule } from './chat/chat.module';
import { UsuarioModule } from './usuario/usuario.module';
import { PlanesModule } from './planes/planes.module';
import { SoftwareModule } from './software/software.module';
import { FilesController } from './files/files.controller';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

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
      ServeStaticModule.forRoot({
        rootPath: join(__dirname, '..', 'uploads'), // Carpeta donde se almacenan los archivos subidos
        serveRoot: '/uploads', // Ruta base para acceder a los archivos (ejemplo: http://localhost:3000/uploads/archivo.jpg)
      }),
    ],
    
  controllers: [AppController, FilesController],
  providers: [AppService],
})
export class AppModule {}