import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { UsuarioController } from './usuario.controller';

// Entidades
import { Rol } from 'src/entities/Rol.entity';
import { Usuario } from 'src/entities/Usuario.entity';
import { Sucursales } from 'src/entities/Sucursales.entity';
import { Clientes } from 'src/entities/Clientes.entity';

// Servicios comunes y Casos de Uso
import { UsuarioValidationService } from './application/common/usuario-validation.service';
import { UpdateProfileUseCase } from './application/update-profile.use-case';
import { GetProfileUseCase } from './application/get-profile.use-case';
import { ListUsersUseCase } from './application/list-users.use-case';
import { RegisterEmployeeUseCase } from './application/register-employee.use-case';
import { AssignRoleUseCase } from './application/assign-role.use-case';
import { DeactivateUserUseCase } from './application/deactivate-user.use-case';
import { ActivateUserUseCase } from './application/activate-user.use-case';
import { ReassignUserUseCase } from './application/reassign-user.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, Rol, Sucursales, Clientes]), 
    AuthModule
  ],
  controllers: [UsuarioController],
  providers: [
    UsuarioValidationService,
    UpdateProfileUseCase,
    GetProfileUseCase,
    ListUsersUseCase,
    RegisterEmployeeUseCase,
    AssignRoleUseCase,
    DeactivateUserUseCase,
    ActivateUserUseCase,
    ReassignUserUseCase,
  ],
  exports: [
    // Si necesitas exportar algún caso de uso a otros módulos en el futuro
  ]
})
export class UsuarioModule {}