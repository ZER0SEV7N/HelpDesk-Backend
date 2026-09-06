import { Module } from '@nestjs/common';
import { CitasController } from './citas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateCitaUseCase } from './application/create-cita.use-case';
import { FindAllCitaUseCase } from './application/find-all-cita.use-case';
import { FindOneCitaUseCase } from './application/find-one-cita.use-case';
import { RelocateCitaUseCase } from './application/relocate-cita.use-case';
import { UpdateCitaUseCase } from './application/update-cita.use-case';
import { AddTicketsToCitaUseCase } from './application/add-tickets-to-cita.use-case';
import { StartCitaUseCase } from './application/start-cita.use-case';
import { CompleteCitaUseCase } from './application/complete-cita.use-case';
import { CancelCitaUseCase } from './application/cancel-cita.use-case';
import { AuthModule } from '@/modules/auth/auth.module';
import { AllEntities } from '@/all_entity';
import { UsuarioModule } from '@/modules/usuario/usuario.module';
import { CronogramaCitaUseCase } from './application/cronograma-cita.use-case';

@Module({
  controllers: [CitasController],
  providers: [
    // Casos de uso
    CreateCitaUseCase,
    FindAllCitaUseCase,
    CronogramaCitaUseCase,
    FindOneCitaUseCase,
    RelocateCitaUseCase,
    UpdateCitaUseCase,
    AddTicketsToCitaUseCase,
    StartCitaUseCase,
    CompleteCitaUseCase,
    CancelCitaUseCase,
  ], // Aca se agregaran casos de uso y servicios relacionados con Citas
  imports: [TypeOrmModule.forFeature(AllEntities), UsuarioModule, AuthModule], // Importar la entidad Citas para que TypeORM la reconozca
})
export class CitasModule {}
