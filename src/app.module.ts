import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ClientesModule } from './clientes/clientes.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { 1Module } from './1/1.module';
import { SoftwareModule } from './software/software.module';
import { HardwardModule } from './hardward/hardward.module';

@Module({
  imports: [DatabaseModule, ClientesModule, AuthModule, UserModule, 1Module, SoftwareModule, HardwardModule, ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
