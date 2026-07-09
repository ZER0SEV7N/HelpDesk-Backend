import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Importaciones de Seguridad y Módulos Externos nativos de tu app
import { AuthModule } from '@/modules/auth/auth.module';
import { ChatModule } from '@/common/chat/chat.module';

// Todas las Entidades de TypeORM
import { Clientes } from '@/entities/Clientes.entity';
import { Sucursales } from '@/entities/Sucursales.entity';
import { Area } from '@/entities/Area.entity';
import { Usuario } from '@/entities/Usuario.entity';
import { Planes } from '@/entities/Planes.entity';
import { Equipos } from '@/entities/Equipos.entity';

// Los 3 Controladores de la API
import { ClientesController } from './cliente/clientes.controller';
import { SucursalController } from './sucursales/sucursal.controller';
import { AreaController } from './areas/area.controller';

// --- CAPA DE APLICACIÓN (HELPERS) ---
import { AreaResponseHelper } from './areas/helpers/area-response.helper';
import { SucursalResponseHelper } from './sucursales/helpers/sucursal-response.helper';
import { ClienteResponseHelper } from './cliente/helpers/cliente-response.helper';

// --- CAPA DE APLICACIÓN (CASOS DE USO) ---
// Áreas
import { CreateAreaUseCase } from './areas/application/create-area.use-case';
import { UpdateAreaUseCase } from './areas/application/update-area.use-case';
import { FindAllAreaUseCase } from './areas/application/find-all-area.use-case';
import { FindOneAreaUseCase } from './areas/application/find-one-area.use-case';
import { FindBySucursalUseCase } from './areas/application/find-by-sucursal-use-case';
import { DeactivateAreaUseCase } from './areas/application/deactivate-area.use-case';
import { ReactivateAreaUseCase } from './areas/application/reactivate-area.use-case';

// Sucursales
import { CreateSucursalUseCase } from './sucursales/application/create-sucursal.use-case';
import { FindAllSucursalesUseCase } from './sucursales/application/find-all-sucursales.use-case';
import { FindOneSucursalUseCase } from './sucursales/application/find-one-sucursal.use-case';
import { FindByClienteUseCase } from './sucursales/application/find-by-cliente.use-case';
import { UpdateSucursalUseCase } from './sucursales/application/update-sucursal.use-case';
import { DeactivateSucursalUseCase } from './sucursales/application/deactivate-sucursal.use-case';
import { ReactivateSucursalUseCase } from './sucursales/application/reactivate-sucursal.use-case';

// Clientes
import { CreateClienteUseCase } from './cliente/application/create-cliente.use-case';
import { FindAllClientesUseCase } from './cliente/application/find-all-clientes.use-case';
import { FindOneClienteUseCase } from './cliente/application/find-one-cliente.use-case';
import { UpdateClienteUseCase } from './cliente/application/update-cliente.use-case';
import { UpdateContractUseCase } from './cliente/application/update-contract.use-case';
import { DeactivateClienteUseCase } from './cliente/application/deactivate-cliente.use-case';
import { ReactivateClienteUseCase } from './cliente/application/reactivate-cliente.use-case';

// --- AUTOMATIZACIONES Y TAREAS CRON ---
import { ClienteCronService } from './cliente/cliente-cron.service';



@Module({
  imports: [
    TypeOrmModule.forFeature([Clientes, Sucursales, Area, Usuario, Planes, Equipos]),
    AuthModule,
    ChatModule
  ],
  controllers: [
    ClientesController,
    SucursalController,
    AreaController
  ],
  providers: [
    // Helpers de Limpieza de Respuestas
    AreaResponseHelper,
    SucursalResponseHelper,
    ClienteResponseHelper,

    // Casos de Uso de Áreas
    CreateAreaUseCase,
    FindAllAreaUseCase,
    FindOneAreaUseCase,
    FindBySucursalUseCase,
    UpdateAreaUseCase,
    DeactivateAreaUseCase,
    ReactivateAreaUseCase,

    // Casos de Uso de Sucursales
    CreateSucursalUseCase,
    FindAllSucursalesUseCase,
    FindOneSucursalUseCase,
    FindByClienteUseCase,
    UpdateSucursalUseCase,
    DeactivateSucursalUseCase,
    ReactivateSucursalUseCase,

    // Casos de Uso de Clientes
    CreateClienteUseCase,
    FindAllClientesUseCase,
    FindOneClienteUseCase,
    UpdateClienteUseCase,
    UpdateContractUseCase,
    DeactivateClienteUseCase,
    ReactivateClienteUseCase,

    // Tareas Programadas y Alertas WebSockets (@Cron)
    ClienteCronService
  ],
})
export class ClientesModule {}