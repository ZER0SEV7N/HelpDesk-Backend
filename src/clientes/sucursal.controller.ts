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

    //------------------------------------------
    //Crear una nueva sucursal para un cliente existente (Admin, Cliente Empresa)
    //POST /sucursales
    //Alcance: El administrador, y el cliente empresa pueden crear una nueva sucursal para un cliente existente
    //------------------------------------------
    @Post()
    @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA')
    create(@Body() dto: CreateSucursalDto) {
        return this.sucursalService.create(dto);
    }

    //------------------------------------------
    //Obtener todas las sucursales (Admin, Cliente Empresa, Cliente Sucursal)
    //GET /sucursales
    //Alcance: El administrador, el cliente empresa y el cliente sucursal pueden obtener la lista de sucursales
    //------------------------------------------
    @Get()
    @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA')
    findAll() {
        return this.sucursalService.findAll();
    }

    //------------------------------------------
    //Obtener una sucursal por ID (Admin, Cliente Empresa, Cliente Sucursal)
    //GET /sucursales/:id
    //Alcance: El administrador, el cliente empresa y el cliente sucursal pueden obtener los detalles de una sucursal por ID
    //------------------------------------------
    @Get(':id')
    @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA', 'CLIENTE_SUCURSAL')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.sucursalService.findOne(id);
    }

    //------------------------------------------
    //Obtener las sucursales de un cliente especifico (Admin)
    //GET /sucursales/cliente/:id_cliente
    //Alcance: El administrador puede obtener las sucursales de un cliente especifico
    //------------------------------------------
    @Get('cliente/:id_cliente')
    @Roles('ADMINISTRADOR')
    findByCliente(@Param('id_cliente', ParseIntPipe) id_cliente: number) {
        return this.sucursalService.findByCliente(id_cliente);
    }

    //------------------------------------------
    //Actualizar los datos de una sucursal (Admin, Cliente Empresa)
    //PATCH /sucursales/:id
    //Alcance: El administrador y el cliente empresa pueden actualizar los datos de una sucursal
    //------------------------------------------
    @Patch(':id')
    @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateSucursalDto>) {
        return this.sucursalService.update(id, dto);
    }

    //------------------------------------------
    //Desactivar una sucursal (Admin, Cliente Empresa)
    //PATCH /sucursales/:id/desactivar
    //Alcance: El administrador y el cliente empresa pueden desactivar una sucursal
    //------------------------------------------
    @Patch(':id/desactivar')
    @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA')
    deactivate(@Param('id', ParseIntPipe) id: number) {
        return this.sucursalService.deactivate(id);
    }

    //------------------------------------------
    //Reactivar una sucursal (Admin, Cliente Empresa)
    //PATCH /sucursales/:id/activar
    //Alcance: El administrador y el cliente empresa pueden reactivar una sucursal
    //------------------------------------------
    @Patch(':id/activar')
    @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA')
    reactivate(@Param('id', ParseIntPipe) id: number) {
        return this.sucursalService.reactivate(id);
    }
}