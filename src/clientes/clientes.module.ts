import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientesService } from './clientes.service';
import { ClientesController } from './clientes.controller';
import { Clientes } from 'src/entities/Clientes.entity';
import { Sucursales } from 'src/entities/Sucursales.entity';
import { Area } from 'src/entities/Area.entity';
import { AuthModule } from 'src/auth/auth.module';
import { SucursalService } from './sucursal.service';
import { AreaService } from './area.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Clientes, Sucursales, Area]),
    AuthModule
  ],
  controllers: [ClientesController],
  providers: [ClientesService, SucursalService, AreaService],
})
export class ClientesModule {}