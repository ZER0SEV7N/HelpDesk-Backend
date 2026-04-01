//helpdesk-app/src/usuario/usuario.controller.ts
//Controlador para manejar las rutas relacionadas con los usuarios
//Funcionalidades:
//1. Actualizar perfil del usuario (nombre, apellido, correo, telefono, contraseña)
//2. Eliminar cuenta del usuario (cambiar estado a inactivo) (Solo Admin)
//3. Obtener perfil del usuario
//4. Crear nuevo empleado (Solo Admin)
//5. Asignar rol a un usuario (Solo Admin)
import { Controller, Post, Body, Patch, Get, Param, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UpdateProfileDTO } from './dto/update-profile.dto';
import { RegisterEmployeeDto } from './dto/register-employee.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/auth/decorators/role.decorator';
import { ReassignUserDto } from './dto/reassign-user.dto';

@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  //Modificar su propio perfil de usuario
  //PATCH /usuario/perfil
  //Alcance: Todos los roles pueden modificar su propio perfil.
  @Patch('perfil')
  @UseGuards(JwtAuthGuard)
  updateProfile(@Req() req: any, @Body() dto: UpdateProfileDTO){
      return this.usuarioService.updateProfile(req.user.userId, dto);      
  }

  //Obtener tu propio perfil de usuario
  //GET /usuario
  //Alcance: Todos los roles pueden obtener su propio perfil.
  @Get('perfil')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: any){
      return this.usuarioService.getProfile(req.user.userId);
  }

  //Listar todos los usuarios (Solo Admin)
  //GET /usuario/list
  @Get('list')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMINISTRADOR')
  listUsers() {
      return this.usuarioService.listUsers();
  }

  //Registrar un nuego empleado (Solo Admin)
  //POST /usuario/registrar-empleado
  //Alcance: Solo el administrador puede registrar un nuevo empleado
  @Post('registrar-empleado')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMINISTRADOR')
  registerEmployee(@Body() dto: RegisterEmployeeDto, @Req() req: any){
    return this.usuarioService.registerEmployee(dto, req.user.role);
  }

  //Asignar rol a un usuario (Solo Admin)
  //PATCH /usuario/:id/rol
  //Alcance: Solo el administrador puede asignar roles a otros usuarios
  @Patch(':id/rol')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMINISTRADOR')
  assignRole(@Param('id', ParseIntPipe) id: number, @Body('rolNombre') rolNombre: string){
    return this.usuarioService.assignRole(id, rolNombre);
  }

  //Desactivar cuenta de un usuario (Solo Admin)
  //PATCH /usuario/:id/desactivar
  //Alcance: Solo el administrador puede desactivar la cuenta de un usuario
  @Patch(':id/desactivar')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMINISTRADOR')
  deactivateUser(@Param('id', ParseIntPipe) id: number){
    return this.usuarioService.deactivateUser(id);
  }

  //Activar cuenta de un usuario (Solo Admin)
  //PATCH /usuario/:id/activar
  //Alcance: Solo el administrador puede activar la cuenta de un usuario
  @Patch(':id/activar')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMINISTRADOR')
  activateUser(@Param('id', ParseIntPipe) id: number){
    return this.usuarioService.activateUser(id);
  }

  //Reasignar un usuario a otra sucursal o cliente (Solo Admin)
  //PATCH /usuario/:id/reasignar
  //Alcance: Solo el administrador puede reasignar un usuario a otra sucursal o cliente
  @Patch(':id/reasignar')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMINISTRADOR')
  reassignUser(@Param('id', ParseIntPipe) id: number, @Body() dto: ReassignUserDto){
    return this.usuarioService.reassignUser(id, dto);
  }
}
