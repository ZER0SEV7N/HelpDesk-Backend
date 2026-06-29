//helpDesk-Backend/src/usuario/usuario.service.ts
//Servicio para manejar la logica de negocio relacionada con los usuarios
//Funcionalidades:
//1. Actualizar perfil del usuario (nombre, apellido, correo, telefono, contraseña)
//2. Eliminar cuenta del usuario (cambiar estado a inactivo) Solo Admin
//3. Obtener perfil del usuario
//4. Listar usuarios (Solo Admin)
//5. Asignar rol a un usuario (Solo Admin)
//Importaciones necesarias:
import {
  Injectable,

} from '@nestjs/common';
import { GetUsersFilterDto } from './dto/get-users-filter.dto';
import { UpdateProfileDTO } from './dto/update-profile.dto';
import { RegisterEmployeeDto } from './dto/register-employee.dto';
import { ReassignUserDto } from './dto/reassign-user.dto';
import { UsuarioProfileService } from './sub-services/usuario-profile.service';
import { UsuarioAdminService } from './sub-services/usuario-admin.service';

//Servicio para manejar la logica de negocio relacionada con los usuarios
@Injectable()
export class UsuarioService {
  constructor(
    private readonly profileService: UsuarioProfileService,
    private readonly adminService: UsuarioAdminService,
  ) {}

  // --- MÉTODOS DE PERFIL DE USUARIO ---

  //Metodo para actualizar el perfil del usuario
  //PATCH /usuario/profile
  //TODOS los usuarios pueden actualizar su perfil, pero deben proporcionar su contraseña actual para validar su identidad
  async updateProfile(userId: number, dto: UpdateProfileDTO) {
    return this.profileService.updateProfile(userId, dto);
  }

  //Metodo para obtener el perfil del usuario
  //GET /usuario
  async getProfile(userId: number) {
    return this.profileService.getProfile(userId);
  }

  // --- MÉTODOS ADMINISTRATIVOS ---

  //Metodo para listar todos los usuarios
  //(Solo Cliente_Empresa y cliente_sucursal pueden listar solo los usuarios de su empresa o sucursal respectivamente)
  //GET /usuario/list
  async listUsers(userPayload: any, filters: GetUsersFilterDto) {
    return this.adminService.listUsers(userPayload, filters);
  }

  //Metodo para registrar un nuevo empleado (Solo Cliente_Empresa)
  //POST /usuario/register-employee
  async registerEmployee(dto: RegisterEmployeeDto, userPayload: any) {
    return this.adminService.registerEmployee(dto, userPayload);
  }

  //Metodo para registrar empleados de forma masiva mediante un archivo CSV (Solo Cliente_Empresa)
  //POST /usuario/register-bulk-employees
  async registerBulkEmployees(fileBuffer: Buffer, userPayload: any) {
    return this.adminService.registerBulkEmployees(fileBuffer, userPayload);
  }

  //Metodo para confirmar el correo del empleado y guardar el registro final en la base de datos
  //GET /usuario/confirmar-correo
  async confirmEmail(correo: string, token: string) {
    return this.adminService.saveFinalEmployee(correo, token);
  }

  //Metodo para asignar roles de manera manual
  //
  //PATCH /usuario/:id/rol
  //Jefes de Empresa pueden asignar roles a los usuarios de su empresa,
  //pero no pueden otorgar permisos de ADMINISTRADOR ni crear otros CLIENTE_EMPRESA. Solo el ADMINISTRADOR general puede asignar cualquier rol.
  async assignRole(targetUserId: number, newRoleName: string, userPayload: any) {
    return this.adminService.assignRole(targetUserId, newRoleName, userPayload);
  }

  //Metodo para desactivar la cuenta de un usuario (Solo Admin)
  //PATCH /usuario/:id/deactivate
  async deactivateUser(targetUserId: number, userPayload: any) {
    return this.adminService.changeStatus(targetUserId, false, userPayload);
  }
  
  //Metodo para reactivar la cuenta de un usuario (Solo Admin)
  //PATCH /usuario/:id/activate}
  async activateUser(targetUserId: number, userPayload: any) {
    return this.adminService.changeStatus(targetUserId, true, userPayload);
  }

  //Metodo para reasignar un usuario a otra empresa o sucursal (Solo Admin)
  //PATCH /usuario/:id/reassign
  async reassignUser(userId: number, dto: ReassignUserDto, userPayload: any) {
    return this.adminService.reassignUser(userId, dto, userPayload);
  }
}
