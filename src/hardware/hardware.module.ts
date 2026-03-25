import { Module } from '@nestjs/common';
import { HardwareService } from './hardware.service';
import { HardwareController } from './hardware.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hardware } from '../entities/Hardware.entity';
import { RegistroHardware } from '../entities/RegistroHardware.entity';

@Module({
  controllers: [HardwareController],
  providers: [HardwareService],
  imports: [TypeOrmModule.forFeature([Hardware, RegistroHardware])],
})
export class HardwareModule {}

