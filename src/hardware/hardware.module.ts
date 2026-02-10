import { Module } from '@nestjs/common';
import { HardwareService } from './hardware.service';
import { HardwareController } from './hardware.controller';

@Module({
  providers: [HardwareService],
  controllers: [HardwareController]
})
export class HardwareModule {}
