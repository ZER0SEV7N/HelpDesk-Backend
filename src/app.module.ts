import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { ClientesModule } from './clientes/clientes.module';

@Module({
  imports: [DatabaseModule, UserModule, ClientesModule, ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
