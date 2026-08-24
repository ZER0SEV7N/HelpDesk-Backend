import { Module } from '@nestjs/common';
import { CitasController } from './citas.controller';
import { Citas_Soporte } from '@/entities/Citas-Soporte.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateCitaUseCase } from './application/create-cita.use-case';
import { Tickets } from '@/entities/Tickets.entity';
import { ListCitaUseCase } from './application/list-cita.use-case';
import { FindOneCitaUseCase } from './application/find-one-cita.use-case';
import { RelocateCitaUseCase } from './application/relocate-cita.use-case';
import { UpdateCitaUseCase } from './application/update-cita.use-case';
import { Usuario } from '@/entities/Usuario.entity';
import { AddTicketsToCitaUseCase } from './application/add-tickets-to-cita.use-case';

@Module({
  controllers: [CitasController],
  providers: [
    // Casos de uso
    CreateCitaUseCase,
    ListCitaUseCase,
    FindOneCitaUseCase,
    RelocateCitaUseCase,
    UpdateCitaUseCase,
    AddTicketsToCitaUseCase,
  ], // Aca se agregaran casos de uso y servicios relacionados con Citas
  imports: [TypeOrmModule.forFeature([Citas_Soporte, Tickets, Usuario])], // Importar la entidad Citas para que TypeORM la reconozca
})
export class CitasModule {}
