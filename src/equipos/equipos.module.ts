import { Module } from '@nestjs/common';
import { EquiposService } from './equipos.service';
import { EquiposController } from './equipos.controller';

@Module({
  controllers: [EquiposController],
  providers: [EquiposService],
})
export class EquiposModule {}
