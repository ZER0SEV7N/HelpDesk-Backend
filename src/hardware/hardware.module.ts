import { Module } from '@nestjs/common';
import { HardwareService } from './hardware.service';
import { HardwareController } from './hardware.controller';

@Module({
  controllers: [HardwareController],
  providers: [HardwareService],
})
export class HardwareModule {}
