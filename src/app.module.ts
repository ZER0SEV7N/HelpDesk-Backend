import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { HardwareModule } from './hardware/hardware.module';

@Module({
  imports: [DatabaseModule, UserModule, HardwareModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
