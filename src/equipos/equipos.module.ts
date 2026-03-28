// src/equipos/equipos.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EquiposService } from './equipos.service';
import { EquiposController } from './equipos.controller';
import { AllEntities } from 'src/all_entity';

@Module({
  imports: [TypeOrmModule.forFeature(AllEntities)],
  controllers: [EquiposController],
  providers: [EquiposService],
})
export class EquiposModule {}