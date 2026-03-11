import { Module } from '@nestjs/common';
import { EquiposService } from './equipos.service';
import { EquiposController } from './equipos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Equipos } from 'src/entities/Equipos.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Equipos])],
  controllers: [EquiposController],
  providers: [EquiposService],
})
export class EquiposModule {}
