//helpDesk-Backend/src/usuario/usuario.service.ts
//Servicio para manejar la logica de negocio relacionada con los usuarios
//Funcionalidades:
//1. Actualizar perfil del usuario (nombre, apellido, correo, telefono, contraseña)
//2. Eliminar cuenta del usuario (cambiar estado a inactivo) Solo Admin
//3. Obtener perfil del usuario
//4. Listar usuarios (Solo Admin)
//5. Asignar rol a un usuario (Solo Admin)
//Importaciones necesarias:
import { Injectable } from '@nestjs/common';
import { GetUsersFilterDto } from './dto/get-users-filter.dto';
import { UpdateProfileDTO } from './dto/update-profile.dto';
import { RegisterEmployeeDto } from './dto/register-employee.dto';
import { ReassignUserDto } from './dto/reassign-user.dto';
import { UsuarioProfileService } from './sub-services/usuario-profile.service';
import { UsuarioAdminService } from './sub-services/usuario-admin.service';
import { JwtPayload } from '@/common/guards/jwt-auth.guard';

@Injectable()
export class UsuarioService {
  constructor(
    private readonly profileService: UsuarioProfileService,
    private readonly adminService: UsuarioAdminService,
  ) {}

  async updateProfile(userId: number, dto: UpdateProfileDTO) {
    return this.profileService.updateProfile(userId, dto);
  }

  async getProfile(userId: number) {
    return this.profileService.getProfile(userId);
  }

  async listUsers(userPayload: JwtPayload, filters: GetUsersFilterDto) {
    return this.adminService.listUsers(userPayload, filters);
  }

  async registerEmployee(dto: RegisterEmployeeDto, userPayload: JwtPayload) {
    return this.adminService.registerEmployee(dto, userPayload);
  }

  async registerBulkEmployees(fileBuffer: Buffer, userPayload: JwtPayload) {
    return this.adminService.registerBulkEmployees(fileBuffer, userPayload);
  }

  async confirmEmail(correo: string, token: string) {
    return this.adminService.saveFinalEmployee(correo, token);
  }

  async assignRole(
    targetUserId: number,
    newRoleName: string,
    userPayload: JwtPayload,
  ) {
    return this.adminService.assignRole(targetUserId, newRoleName, userPayload);
  }

  async deactivateUser(targetUserId: number, userPayload: JwtPayload) {
    return this.adminService.changeStatus(targetUserId, false, userPayload);
  }

  async activateUser(targetUserId: number, userPayload: JwtPayload) {
    return this.adminService.changeStatus(targetUserId, true, userPayload);
  }

  async reassignUser(
    userId: number,
    dto: ReassignUserDto,
    userPayload: JwtPayload,
  ) {
    return this.adminService.reassignUser(userId, dto, userPayload);
  }
}
