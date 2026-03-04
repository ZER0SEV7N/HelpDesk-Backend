import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Planes } from '../entities/planes.entity';
import { PlanesService } from './planes.service';
import { PlanesController } from './planes.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Planes]), AuthModule],
  controllers: [PlanesController],
  providers: [PlanesService],
})
export class PlanesModule {}
