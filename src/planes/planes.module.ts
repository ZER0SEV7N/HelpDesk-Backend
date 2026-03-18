import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Planes } from '../entities/Planes.entity';
import { PlanesService } from './planes.service';
import { PlanesController } from './planes.controller';
import { AuthModule } from '../auth/auth.module';
import { Rol } from 'src/entities/Rol.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Planes, Rol]), AuthModule],
  controllers: [PlanesController],
  providers: [PlanesService],
})
export class PlanesModule {}
