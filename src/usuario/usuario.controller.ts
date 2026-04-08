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
  //Solicita
  /*{
  "currentPassword": "contraseñaActual",
  "nombre": "NuevoNombre",
  "apellido": "NuevoApellido",
  "correo": "Correo",
  "telefono": "Telefono",
  "nuevaContraseña": "NuevaContraseña"
  }*/
  @Patch('perfil')
  @UseGuards(JwtAuthGuard)
  updateProfile(@Req() req: any, @Body() dto: UpdateProfileDTO){
      return this.usuarioService.updateProfile(req.user.userId, dto);      
  }

  //Obtener tu propio perfil de usuario
  //GET /usuario/perfil
  //Alcance: Todos los roles pueden obtener su propio perfil.
  @Get('perfil')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: any){
      return this.usuarioService.getProfile(req.user.userId);
  }

  //Listar todos los usuarios (Solo Cliente_Empresa y Cliente_Sucursal)
  //GET /usuario/list
  @Get('list')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('CLIENTE_EMPRESA', 'CLIENTE_SUCURSAL')
  listUsers(@Req() req: any) {
      return this.usuarioService.listUsers(req.user);
  }

  //Registrar un nuego empleado 
  //POST /usuario/registrar-empleado
  //Alcance: Solo la empresa puede registrar un nuevo empleado
  @Post('registrar-empleado')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA')
  registerEmployee(@Body() dto: RegisterEmployeeDto, @Req() req: any){
    return this.usuarioService.registerEmployee(dto, req.user);
  }

  //Asignar rol a un usuario
  //PATCH /usuario/:id/rol
  //Alcance: Solo el administrador puede asignar o cambiar el rol de un usuario. 
  //La empresa puede asignar roles a sus propios empleados pero no puede cambiar roles de usuarios que no le pertenecen.
  @Patch(':id/rol')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA')
  assignRole(@Param('id', ParseIntPipe) id: number, 
            @Body('rolNombre') rolNombre: string,
            @Req() req: any){
    return this.usuarioService.assignRole(id, rolNombre, req.user);
  }

  //Desactivar cuenta de un usuario 
  //PATCH /usuario/:id/desactivar
  //Alcance: el administrador puede desactivar cualquier usuario. 
  // La empresa puede desactivar solo a sus propios empleados.
  @Patch(':id/desactivar')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA')
  deactivateUser(@Param('id', ParseIntPipe) id: number,
                @Req() req: any){
    return this.usuarioService.deactivateUser(id, req.user);
  }

  //Activar cuenta de un usuario 
  //PATCH /usuario/:id/activar
  //Alcance: el administrador puede activar las cuentas de los usuarios que desactivó. 
  //La empresa puede activar las cuentas de sus propios empleados que desactivó, pero no puede activar usuarios que no le pertenecen.
  @Patch(':id/activar')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA')
  activateUser(@Param('id', ParseIntPipe) id: number,
                @Req() req: any){
    return this.usuarioService.activateUser(id, req.user);
  }

  //Reasignar un usuario a otra sucursal o cliente 
  //PATCH /usuario/:id/reasignar
  //Alcance: Solo el administrador puede reasignar un usuario a otra sucursal o cliente
  @Patch(':id/reasignar')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA')
  reassignUser(@Param('id', ParseIntPipe) id: number, 
              @Body() dto: ReassignUserDto,
              @Req() req: any){
    return this.usuarioService.reassignUser(id, dto, req.user);
  }
}
