import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Hardware, HardwareSchema } from '../../schemas/hardware.schema';
import { HardwareService } from './hardware.service';
import { HardwareController } from './hardware.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Hardware.name, schema: HardwareSchema }]),
  ],
  controllers: [HardwareController],
  providers: [HardwareService],
  exports: [HardwareService],
})
export class HardwareModule {}
