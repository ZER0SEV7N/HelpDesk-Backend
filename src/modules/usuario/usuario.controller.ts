//helpdesk-app/src/usuario/usuario.controller.ts
//Controlador para manejar las rutas relacionadas con los usuarios
//Funcionalidades:
//1. Actualizar perfil del usuario (nombre, apellido, correo, telefono, contraseña)
//2. Eliminar cuenta del usuario (cambiar estado a inactivo) (Solo Admin)
//3. Obtener perfil del usuario
//4. Crear nuevo empleado (Solo Admin)
//5. Asignar rol a un usuario (Solo Admin)
import {
  Controller,
  Post,
  Body,
  Patch,
  Get,
  Param,
  UseGuards,
  Req,
  ParseIntPipe,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UpdateProfileDTO } from './dto/update-profile.dto';
import { RegisterEmployeeDto } from './dto/register-employee.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RoleGuard } from '@/common/guards/role.guard';
import { Roles } from '@/common/decorators/role.decorator';
import { ReassignUserDto } from './dto/reassign-user.dto';
import { GetUsersFilterDto } from './dto/get-users-filter.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtPayload } from '@/common/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Patch('perfil')
  @UseGuards(JwtAuthGuard)
  updateProfile(
    @Req() req: Request & { user: JwtPayload },
    @Body() dto: UpdateProfileDTO,
  ) {
    return this.usuarioService.updateProfile(req.user.userId, dto);
  }

  @Get('perfil')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: Request & { user: JwtPayload }) {
    return this.usuarioService.getProfile(req.user.userId);
  }

  @Get('list')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA', 'CLIENTE_SUCURSAL')
  listUsers(
    @Req() req: Request & { user: JwtPayload },
    @Query() filters: GetUsersFilterDto,
  ) {
    return this.usuarioService.listUsers(req.user, filters);
  }

  @Post('registrar-empleado')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA')
  registerEmployee(
    @Body() dto: RegisterEmployeeDto,
    @Req() req: Request & { user: JwtPayload },
  ) {
    return this.usuarioService.registerEmployee(dto, req.user);
  }

  @Post('registrar-masivo')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA')
  @UseInterceptors(FileInterceptor('file'))
  registerBulkEmployees(
    @Req() req: Request & { user: JwtPayload },
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 })],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.usuarioService.registerBulkEmployees(file.buffer, req.user);
  }

  @Get('confirmar-correo')
  confirmEmail(@Query('correo') correo: string, @Query('token') token: string) {
    return this.usuarioService.confirmEmail(correo, token);
  }

  @Patch(':id/rol')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA')
  assignRole(
    @Param('id', ParseIntPipe) id: number,
    @Body('rolNombre') rolNombre: string,
    @Req() req: Request & { user: JwtPayload },
  ) {
    return this.usuarioService.assignRole(id, rolNombre, req.user);
  }

  @Patch(':id/desactivar')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA')
  deactivateUser(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request & { user: JwtPayload },
  ) {
    return this.usuarioService.deactivateUser(id, req.user);
  }

  @Patch(':id/activar')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA')
  activateUser(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request & { user: JwtPayload },
  ) {
    return this.usuarioService.activateUser(id, req.user);
  }

  @Patch(':id/reasignar')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA')
  reassignUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReassignUserDto,
    @Req() req: Request & { user: JwtPayload },
  ) {
    return this.usuarioService.reassignUser(id, dto, req.user);
  }
}
