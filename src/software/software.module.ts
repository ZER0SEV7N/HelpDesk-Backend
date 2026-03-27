// src/software/software.module.ts
// Módulo para la gestión de Software
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SoftwareService } from './software.service';
import { SoftwareController } from './software.controller';
import { Software } from './entities/software.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Software])],
  controllers: [SoftwareController],
  providers: [SoftwareService],
})
export class SoftwareModule {}
