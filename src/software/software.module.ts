// src/software/software.module.ts
// Módulo para la gestión de Software
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SoftwareService } from './software.service';
import { SoftwareController } from './software.controller';
import { Software } from '../entities/Software.entity';
import { Software_equipos } from '@/entities/SoftwareEquipos.entity';
import { Equipos } from '@/entities/Equipos.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Software, Software_equipos, Equipos])],
  controllers: [SoftwareController],
  providers: [SoftwareService],
})
export class SoftwareModule {}
