import { Module } from '@nestjs/common';
import { CitasController } from './citas.controller';
import { Citas } from '@/entities/Citas.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateCitaUseCase } from './application/create-cita.use-case';

@Module({
  controllers: [CitasController],
  providers: [
    // Casos de uso
    CreateCitaUseCase,
  ], // Aca se agregaran casos de uso y servicios relacionados con Citas
  imports: [TypeOrmModule.forFeature([Citas])], // Importar la entidad Citas para que TypeORM la reconozca
})
export class CitasModule {}
