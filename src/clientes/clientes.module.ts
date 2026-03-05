import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Empresa, EmpresaSchema } from '../schemas/empresa.schema';
import { ClientesService } from './clientes.service';
import { ClientesController } from './clientes.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Empresa.name, schema: EmpresaSchema }]),
  ],
  controllers: [ClientesController],
  providers: [ClientesService],
})
export class ClientesModule {}
