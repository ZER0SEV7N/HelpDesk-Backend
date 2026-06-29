//helpdesk-app/src/usuario/usuario.module.ts
//Modulo para manejar las funcionalidades relacionadas con los usuarios
import { Module } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { Rol } from '@/entities/Rol.entity';
import { Usuario } from '@/entities/Usuario.entity';
import { AuthModule } from '@/modules/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sucursales } from '@/entities/Sucursales.entity';
import { Clientes } from '@/entities/Clientes.entity';
import { UsuarioProfileService } from './sub-services/usuario-profile.service';
import { EmployeeRegistrationManager } from './managers/employee-registration.manager';
import { UsuarioAdminService } from './sub-services/usuario-admin.service';
import { NotificationGateway } from '@/common/websockets/notification.gateway';
import { CsvProcessorUtil } from '@/common/bulk-upload/csv-processor.util';

@Module({
  controllers: [UsuarioController],
  providers: [
    UsuarioService,
    UsuarioProfileService,
    UsuarioAdminService,
    EmployeeRegistrationManager,
    NotificationGateway,
    CsvProcessorUtil,
  ],
  imports: [
    TypeOrmModule.forFeature([Usuario, Rol, Sucursales, Clientes]),
    AuthModule,
  ],
})
export class UsuarioModule {}
