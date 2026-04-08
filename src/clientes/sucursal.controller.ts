//helpdesk-backend/src/clientes/sucursal.service.ts
//Controlador para manejar las sucursales de los clientes
// Importamos los módulos necesarios de NestJS y TypeORM
import { Controller, Get, Post, Body, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { SucursalService } from './sucursal.service';
import { CreateSucursalDto } from './dto/create-sucursal.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/auth/decorators/role.decorator';

@Controller('sucursales')
@UseGuards(JwtAuthGuard, RoleGuard) 
export class SucursalController {
    constructor(private readonly sucursalService: SucursalService) {}

    @Post()
    @Roles('ADMINISTRADOR', 'SOPORTE_TECNICO', 'CLIENTE_EMPRESA')
    create(@Body() dto: CreateSucursalDto) {
        return this.sucursalService.create(dto);
    }

    @Get()
    @Roles('ADMINISTRADOR', 'SOPORTE_TECNICO')
    findAll() {
        return this.sucursalService.findAll();
    }

    @Get(':id')
    @Roles('ADMINISTRADOR', 'SOPORTE_TECNICO', 'CLIENTE_EMPRESA', 'CLIENTE_SUCURSAL')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.sucursalService.findOne(id);
    }

    @Get('cliente/:id_cliente')
    @Roles('ADMINISTRADOR', 'SOPORTE_TECNICO', 'CLIENTE_EMPRESA')
    findByCliente(@Param('id_cliente', ParseIntPipe) id_cliente: number) {
        return this.sucursalService.findByCliente(id_cliente);
    }

    @Patch(':id')
    @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateSucursalDto>) {
        return this.sucursalService.update(id, dto);
    }

    @Patch(':id/desactivar')
    @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA')
    deactivate(@Param('id', ParseIntPipe) id: number) {
        return this.sucursalService.deactivate(id);
    }
}