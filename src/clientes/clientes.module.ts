import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; 
import { ClientesService } from './clientes.service';
import { ClientesController } from './clientes.controller';
import { ENTITIES_ARRAY } from '../all_entities'; // 👈 Importas la lista maestra

@Module({
  imports: [
    // 👇 3. ESTA ES LA LÍNEA QUE TE FALTA. 
    // Sin esto, el Servicio no puede usar el repositorio.
    TypeOrmModule.forFeature(ENTITIES_ARRAY), 
  ],
  controllers: [ClientesController],
  providers: [ClientesService],
})
export class ClientesModule {}