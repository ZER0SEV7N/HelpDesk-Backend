import { Module } from '@nestjs/common';
import { HardwardService } from './hardward.service';
import { HardwardController } from './hardward.controller';

@Module({
  controllers: [HardwardController],
  providers: [HardwardService],
})
export class HardwardModule {}
