// src/equipos/equipos.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EquiposController } from './equipos.controller';
import { AllEntities } from '@/all_entity';

// Casos de uso
import { CreateEquipoUseCase } from './application/create-equipo.use-case';
import { UpdateEquipoUseCase } from './application/update-equipo.use-case';
import { FindOneEquipoUseCase } from './application/find-one-equipo.use-case';
import { FindAllEquiposUseCase } from './application/find-all-equipos.use-case';
import { UpdateEquipoHardwareUseCase } from './application/update-equipo-hardware.use-case';
import { UpdateEquipoSoftwareUseCase } from './application/update-equipo-software.use-case';
import { RemoveEquipoUseCase } from './application/remove-equipo.use-case';
import { AssignEquipoUseCase } from './application/assign-equipo.use-case';
import { UnassignEquipoUseCase } from './application/unassign-equipo.use-case';
import { GetProfileUseCase } from '@/modules/usuario/application/get-profile.use-case';
import { UsuarioModule } from '@/modules/usuario/usuario.module';

@Module({
  imports: [
    TypeOrmModule.forFeature(AllEntities), 
    UsuarioModule // Importar el módulo de usuario para poder usar GetProfileUseCase
  ],
  controllers: [EquiposController],
  providers: [
    CreateEquipoUseCase,
    UpdateEquipoUseCase,
    FindOneEquipoUseCase,
    FindAllEquiposUseCase,
    UpdateEquipoHardwareUseCase,
    UpdateEquipoSoftwareUseCase,
    RemoveEquipoUseCase,
    AssignEquipoUseCase,
    UnassignEquipoUseCase,
  ],
})
export class EquiposModule {}
