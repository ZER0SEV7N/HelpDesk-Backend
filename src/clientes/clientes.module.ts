import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientesService } from './clientes.service';
import { ClientesController } from './clientes.controller';
import { Clientes } from 'src/entities/Clientes.entity';
import { Sucursales } from 'src/entities/Sucursales.entity';
import { Area } from 'src/entities/Area.entity';
import { AuthModule } from 'src/auth/auth.module';
import { SucursalService } from './sucursal.service';
import { AreaService } from './area.service';
import { Usuario } from 'src/entities/Usuario.entity';
import { Planes } from 'src/entities/Planes.entity';
import { Equipos } from 'src/entities/Equipos.entity';
import { ChatModule } from 'src/chat/chat.module';
import { SucursalController } from 'src/clientes/sucursal.controller';
import { AreaController } from './area.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Clientes, Sucursales, Area, Usuario, Planes, Equipos]),
    AuthModule,
    ChatModule
  ],
  controllers: [
    ClientesController,
    SucursalController,
    AreaController
  ],
  providers: [ClientesService, SucursalService, AreaService],
})
export class ClientesModule {}