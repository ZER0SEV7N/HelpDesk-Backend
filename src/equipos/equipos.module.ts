import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Equipo, EquipoSchema } from '../schemas/equipo.schema';
import { EquiposService } from './equipos.service';
import { EquiposController } from './equipos.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Equipo.name, schema: EquipoSchema }]),
  ],
  controllers: [EquiposController],
  providers: [EquiposService],
})
export class EquiposModule {}
