import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientesService } from './clientes.service';
import { ClientesController } from './clientes.controller';
import { Clientes } from '@/entities/Clientes.entity';
import { Sucursales } from '@/entities/Sucursales.entity';
import { Area } from '@/entities/Area.entity';
import { AuthModule } from '@/modules/auth/auth.module';
import { SucursalService } from './sucursal.service';
import { AreaService } from './area.service';
import { Usuario } from '@/entities/Usuario.entity';
import { Planes } from '@/entities/Planes.entity';
import { Equipos } from '@/entities/Equipos.entity';
import { ChatModule } from '@/common/chat/chat.module';
import { SucursalController } from '@/clientes/sucursal.controller';
import { AreaController } from './area.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Clientes,
      Sucursales,
      Area,
      Usuario,
      Planes,
      Equipos,
    ]),
    AuthModule,
    ChatModule,
  ],
  controllers: [ClientesController, SucursalController, AreaController],
  providers: [ClientesService, SucursalService, AreaService],
})
export class ClientesModule {}
