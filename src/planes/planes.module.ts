import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Planes } from '../entities/Planes.entity';
import { PlanesService } from './planes.service';
import { PlanesController } from './planes.controller';
import { AuthModule } from '../auth/auth.module';
import { Rol } from 'src/entities/Rol.entity';
import { Clientes } from 'src/entities/Clientes.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Planes, Rol, Clientes]), AuthModule],
  controllers: [PlanesController],
  providers: [PlanesService],
})
export class PlanesModule {}
