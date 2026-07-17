import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardsController } from './dashboards.controller';
import { DashboardsService } from './dashboards.service';
import { Tickets } from '../entities/Tickets.entity';
import { Usuario } from '../entities/Usuario.entity';
import { Equipos } from '../entities/Equipos.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tickets, Usuario, Equipos])],
  controllers: [DashboardsController],
  providers: [DashboardsService],
})
export class DashboardsModule {}
