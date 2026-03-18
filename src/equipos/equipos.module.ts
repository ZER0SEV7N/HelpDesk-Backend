import { Module } from '@nestjs/common';
import { EquiposService } from './equipos.service';
import { EquiposController } from './equipos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
//import { Equipos } from 'src/entities/Equipos.entity';
//import { Clientes } from 'src/entities/Clientes.entity';
//import { Tickets } from 'src/entities/Tickets.entity';
import { AllEntities } from 'src/all_entity';

@Module({
  imports: [TypeOrmModule.forFeature(AllEntities)],
  controllers: [EquiposController],
  providers: [EquiposService],
})
export class EquiposModule {}
