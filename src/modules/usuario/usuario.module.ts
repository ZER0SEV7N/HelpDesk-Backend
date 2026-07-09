// src/modules/usuario/usuario.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@/modules/auth/auth.module';

// Controladores
import { UsuarioController } from './usuario.controller';
import { AdminUsuarioController } from './admin.controller';

// Entidades
import { Rol } from '@/entities/Rol.entity';
import { Usuario } from '@/entities/Usuario.entity';
import { Sucursales } from '@/entities/Sucursales.entity';
import { Clientes } from '@/entities/Clientes.entity';

// Infraestructura compartida
import { NotificationGateway } from '@/common/websockets/notification.gateway';
import { CsvProcessorUtil } from '@/common/bulk-upload/csv-processor.util';

// Manager
import { EmployeeRegistrationManager } from './managers/employee-registration.manager';

// Servicio de validación común
import { UsuarioValidationService } from './application/common/usuario-validation.service';

// Casos de Uso
import { UpdateProfileUseCase } from './application/update-profile.use-case';
import { GetProfileUseCase } from './application/get-profile.use-case';
import { ListUsersUseCase } from './application/list-users.use-case';
import { RegisterEmployeeUseCase } from './application/register-employee.use-case';
import { RegisterBulkEmployeesUseCase } from './application/register-bulk-employees.use-case';
import { ConfirmEmailUseCase } from './application/confirm-email.use-case';
import { AssignRoleUseCase } from './application/assign-role.use-case';
import { DeactivateUserUseCase } from './application/deactivate-user.use-case';
import { ActivateUserUseCase } from './application/activate-user.use-case';
import { ReassignUserUseCase } from './application/reassign-user.use-case';


@Module({
    imports: [
        TypeOrmModule.forFeature([Usuario, Rol, Sucursales, Clientes]),
        AuthModule,
    ],
    controllers: [UsuarioController, AdminUsuarioController],
    providers: [
        // Infraestructura compartida
        NotificationGateway,
        CsvProcessorUtil,

        // Manager de registro (Redis + WebSocket + Email)
        EmployeeRegistrationManager,

        // Validación común reutilizable entre casos de uso
        UsuarioValidationService,

        // Casos de Uso
        GetProfileUseCase,
        UpdateProfileUseCase,
        ListUsersUseCase,
        RegisterEmployeeUseCase,
        RegisterBulkEmployeesUseCase,
        ConfirmEmailUseCase,
        AssignRoleUseCase,
        DeactivateUserUseCase,
        ActivateUserUseCase,
        ReassignUserUseCase,
    ],
    exports: [],
})
export class UsuarioModule {}
