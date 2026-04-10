import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AreaController } from './area.controller';
import { AreaService } from './area.service';
import { Area } from 'src/entities/Area.entity';
import { Sucursales } from 'src/entities/Sucursales.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Area,
      Sucursales,
    ]),
    AuthModule,
  ],
  controllers: [AreaController],
  providers: [AreaService],
})
export class AreaModule {}