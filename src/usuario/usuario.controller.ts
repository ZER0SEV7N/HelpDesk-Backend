import { Controller, Post, Body, Patch, Get, Param, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { UpdateProfileDTO } from './dto/update-profile.dto';
import { RegisterEmployeeDto } from './dto/register-employee.dto';
import { ReassignUserDto } from './dto/reassign-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/auth/decorators/role.decorator';

// Importaciones de Casos de Uso
import { UpdateProfileUseCase } from './application/update-profile.use-case';
import { GetProfileUseCase } from './application/get-profile.use-case';
import { ListUsersUseCase } from './application/list-users.use-case';
import { RegisterEmployeeUseCase } from './application/register-employee.use-case';
import { AssignRoleUseCase } from './application/assign-role.use-case';
import { DeactivateUserUseCase } from './application/deactivate-user.use-case';
import { ActivateUserUseCase } from './application/activate-user.use-case';
import { ReassignUserUseCase } from './application/reassign-user.use-case';

@Controller('usuario')
export class UsuarioController {
  constructor(
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly getProfileUseCase: GetProfileUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly registerEmployeeUseCase: RegisterEmployeeUseCase,
    private readonly assignRoleUseCase: AssignRoleUseCase,
    private readonly deactivateUserUseCase: DeactivateUserUseCase,
    private readonly activateUserUseCase: ActivateUserUseCase,
    private readonly reassignUserUseCase: ReassignUserUseCase,
  ) {}

  @Patch('perfil')
  @UseGuards(JwtAuthGuard)
  updateProfile(@Req() req: any, @Body() dto: UpdateProfileDTO) {
      return this.updateProfileUseCase.execute(req.user.userId, dto);
  }

  @Get('perfil')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: any) {
      return this.getProfileUseCase.execute(req.user.userId);
  }

  @Get('list')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('CLIENTE_EMPRESA', 'CLIENTE_SUCURSAL', 'ADMINISTRADOR')
  listUsers(@Req() req: any) {
      return this.listUsersUseCase.execute(req.user);
  }

  @Post('registrar-empleado')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA')
  registerEmployee(@Body() dto: RegisterEmployeeDto, @Req() req: any) {
    return this.registerEmployeeUseCase.execute(dto, req.user);
  }

  @Patch(':id/rol')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA')
  assignRole(
    @Param('id', ParseIntPipe) id: number, 
    @Body('rolNombre') rolNombre: string,
    @Req() req: any
  ) {
    return this.assignRoleUseCase.execute(id, rolNombre, req.user);
  }

  @Patch(':id/desactivar')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA')
  deactivateUser(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.deactivateUserUseCase.execute(id, req.user);
  }

  @Patch(':id/activar')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA')
  activateUser(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.activateUserUseCase.execute(id, req.user);
  }

  @Patch(':id/reasignar')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA')
  reassignUser(
    @Param('id', ParseIntPipe) id: number, 
    @Body() dto: ReassignUserDto,
    @Req() req: any
  ) {
    return this.reassignUserUseCase.execute(id, dto, req.user);
  }
}