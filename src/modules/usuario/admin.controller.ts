// src/modules/usuario/admin.controller.ts

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
import { ReassignUserDto } from './dto/reassign-user.dto';
import { RegisterEmployeeDto } from './dto/register-employee.dto';
import { GetUsersFilterDto } from './dto/get-users-filter.dto';

// Casos de Uso
import { ListUsersUseCase } from './application/list-users.use-case';
import { RegisterEmployeeUseCase } from './application/register-employee.use-case';
import { RegisterBulkEmployeesUseCase } from './application/register-bulk-employees.use-case';
import { AssignRoleUseCase } from './application/assign-role.use-case';
import { DeactivateUserUseCase } from './application/deactivate-user.use-case';
import { ActivateUserUseCase } from './application/activate-user.use-case';
import { ReassignUserUseCase } from './application/reassign-user.use-case';

@Controller('usuario')
export class AdminUsuarioController {
    constructor(
        private readonly listUsersUseCase: ListUsersUseCase,
        private readonly registerEmployeeUseCase: RegisterEmployeeUseCase,
        private readonly registerBulkEmployeesUseCase: RegisterBulkEmployeesUseCase,
        private readonly assignRoleUseCase: AssignRoleUseCase,
        private readonly deactivateUserUseCase: DeactivateUserUseCase,
        private readonly activateUserUseCase: ActivateUserUseCase,
        private readonly reassignUserUseCase: ReassignUserUseCase,
    ) {}

    //Listar todos los usuarios (Solo Administrador, Cliente_Empresa y Cliente_Sucursal)
    //GET /usuario/list
    @Get('list')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA')
    listUsers(@Req() req: any, @Query() filters: GetUsersFilterDto) {
        return this.listUsersUseCase.execute(req.user, filters);
    }

    //Registrar un nuego empleado
    //POST /usuario/registrar-empleado
    //Alcance: Solo la empresa puede registrar un nuevo empleado
    @Post('registrar-empleado')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA')
    registerEmployee(@Body() dto: RegisterEmployeeDto, @Req() req: any) {
        return this.registerEmployeeUseCase.execute(dto, req.user);
    }

    //POST /usuario/registrar-masivo
    //Alcance: Solo la empresa puede registrar empleados de forma masiva mediante un archivo CSV
    //El archivo CSV debe tener la siguiente estructura:
    //nombre,apellido,correo,telefono,password,rolNombre,id_cliente,id_sucursal
    //El campo id_cliente y id_sucursal son opcionales y solo se deben incluir si el rol del usuario que registra es ADMINISTRADOR.
    //Si el rol del usuario que registra es CLIENTE_EMPRESA, se asignará automáticamente el id_cliente del usuario que registra y no se permitirá modificarlo.
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

    //Asignar rol a un usuario
    //PATCH /usuario/:id/rol
    //Alcance: Solo el administrador puede asignar o cambiar el rol de un usuario.
    //La empresa puede asignar roles a sus propios empleados pero no puede cambiar roles de usuarios que no le pertenecen.
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

    //Desactivar cuenta de un usuario
    //PATCH /usuario/:id/desactivar
    //Alcance: el administrador puede desactivar cualquier usuario.
    // La empresa puede desactivar solo a sus propios empleados.
    @Patch(':id/desactivar')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA')
    deactivateUser(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
        return this.deactivateUserUseCase.execute(id, req.user);
    }

    //Activar cuenta de un usuario
    //PATCH /usuario/:id/activar
    //Alcance: el administrador puede activar las cuentas de los usuarios que desactivó.
    //La empresa puede activar las cuentas de sus propios empleados que desactivó, pero no puede activar usuarios que no le pertenecen.
    @Patch(':id/activar')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA')
    activateUser(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
        return this.activateUserUseCase.execute(id, req.user);
    }

    //Reasignar un usuario a otra sucursal cliente
    //PATCH /usuario/:id/reasignar
    //Solo el administrador puede reasignar un usuario a otra sucursal o cliente
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