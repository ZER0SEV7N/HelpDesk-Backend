import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SoftwareService } from './software.service';
import { SoftwareController } from './software.controller';
import { Software } from '../entities/Software.entity';
import { Software_equipos } from '@/entities/SoftwareEquipos.entity';
import { Equipos } from '@/entities/Equipos.entity';
import { AuthModule } from '@/modules/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Software, Software_equipos, Equipos]), AuthModule],
  controllers: [SoftwareController],
  providers: [SoftwareService],
})
export class SoftwareModule {}
