import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardsController } from './dashboards.controller';
import { DashboardsService } from './dashboards.service';
import { Tickets } from '../entities/Tickets.entity';
import { Usuario } from '../entities/Usuario.entity';
import { Equipos } from '../entities/Equipos.entity';
import { Citas_Soporte } from '../entities/Citas-Soporte.entity';
import { Clientes } from '../entities/Clientes.entity';
import { Sucursales } from '../entities/Sucursales.entity';
import { AuthModule } from '@/modules/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Tickets,
      Usuario,
      Equipos,
      Citas_Soporte,
      Clientes,
      Sucursales,
    ]),
    AuthModule,
  ],
  controllers: [DashboardsController],
  providers: [DashboardsService],
})
export class DashboardsModule {}
