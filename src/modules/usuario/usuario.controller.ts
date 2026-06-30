// src/modules/usuario/usuario.controller.ts
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
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RoleGuard } from '@/common/guards/role.guard';
import { Roles } from '@/common/decorators/role.decorator';

// DTOs
import { UpdateProfileDTO } from './dto/update-profile.dto';
import { RegisterEmployeeDto } from './dto/register-employee.dto';
import { ReassignUserDto } from './dto/reassign-user.dto';
import { GetUsersFilterDto } from './dto/get-users-filter.dto';

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

@Controller('usuario')
export class UsuarioController {
    constructor(
        private readonly updateProfileUseCase: UpdateProfileUseCase,
        private readonly getProfileUseCase: GetProfileUseCase,
        private readonly listUsersUseCase: ListUsersUseCase,
        private readonly registerEmployeeUseCase: RegisterEmployeeUseCase,
        private readonly registerBulkEmployeesUseCase: RegisterBulkEmployeesUseCase,
        private readonly confirmEmailUseCase: ConfirmEmailUseCase,
        private readonly assignRoleUseCase: AssignRoleUseCase,
        private readonly deactivateUserUseCase: DeactivateUserUseCase,
        private readonly activateUserUseCase: ActivateUserUseCase,
        private readonly reassignUserUseCase: ReassignUserUseCase,
    ) {}

    // PATCH /usuario/perfil
    @Patch('perfil')
    @UseGuards(JwtAuthGuard)
    updateProfile(@Req() req: any, @Body() dto: UpdateProfileDTO) {
        return this.updateProfileUseCase.execute(req.user.userId, dto);
    }

    // GET /usuario/perfil
    @Get('perfil')
    @UseGuards(JwtAuthGuard)
    getProfile(@Req() req: any) {
        return this.getProfileUseCase.execute(req.user.userId);
    }

    // GET /usuario/list
    @Get('list')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA', 'CLIENTE_SUCURSAL')
    listUsers(@Req() req: any, @Query() filters: GetUsersFilterDto) {
        return this.listUsersUseCase.execute(req.user, filters);
    }

    // POST /usuario/registrar-empleado
    @Post('registrar-empleado')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA')
    registerEmployee(@Body() dto: RegisterEmployeeDto, @Req() req: any) {
        return this.registerEmployeeUseCase.execute(dto, req.user);
    }

    // POST /usuario/registrar-masivo
    @Post('registrar-masivo')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA')
    @UseInterceptors(FileInterceptor('file'))
    registerBulkEmployees(
        @Req() req: any,
        @UploadedFile(
            new ParseFilePipe({
                validators: [new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 })],
            }),
        )
        file: Express.Multer.File,
    ) {
        return this.registerBulkEmployeesUseCase.execute(file.buffer, req.user);
    }

    // GET /usuario/confirmar-correo?correo=...&token=...
    @Get('confirmar-correo')
    confirmEmail(@Query('correo') correo: string, @Query('token') token: string) {
        return this.confirmEmailUseCase.execute(correo, token);
    }

    // PATCH /usuario/:id/rol
    @Patch(':id/rol')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA')
    assignRole(
        @Param('id', ParseIntPipe) id: number,
        @Body('rolNombre') rolNombre: string,
        @Req() req: any,
    ) {
        return this.assignRoleUseCase.execute(id, rolNombre, req.user);
    }

    // PATCH /usuario/:id/desactivar
    @Patch(':id/desactivar')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA')
    deactivateUser(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
        return this.deactivateUserUseCase.execute(id, req.user);
    }

    // PATCH /usuario/:id/activar
    @Patch(':id/activar')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA')
    activateUser(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
        return this.activateUserUseCase.execute(id, req.user);
    }

    // PATCH /usuario/:id/reasignar
    @Patch(':id/reasignar')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA')
    reassignUser(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: ReassignUserDto,
        @Req() req: any,
    ) {
        return this.reassignUserUseCase.execute(id, dto, req.user);
    }
}
