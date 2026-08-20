import { Module } from '@nestjs/common';
import { HardwareService } from './hardware.service';
import { HardwareController } from './hardware.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hardware } from '../entities/Hardware.entity';
import { RegistroHardware } from '../entities/RegistroHardware.entity';
import { Equipos } from '@/entities/Equipos.entity';
import { AuthModule } from '@/modules/auth/auth.module';

@Module({
  controllers: [HardwareController],
  providers: [HardwareService],
  imports: [TypeOrmModule.forFeature([Hardware, RegistroHardware, Equipos]), AuthModule],
})
export class HardwareModule {}
