import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientesService } from './clientes.service';
import { ClientesController } from './clientes.controller';
import { Clientes } from 'src/entities/Clientes.entity';
import { Sucursales } from 'src/entities/Sucursales.entity';
import { Area } from 'src/entities/Area.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Clientes, Sucursales, Area]),
    AuthModule
  ],
  controllers: [ClientesController],
  providers: [ClientesService],
})
export class ClientesModule {}