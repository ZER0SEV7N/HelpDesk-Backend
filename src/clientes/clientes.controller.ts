//src/clientes/clientes.controller.ts
//Controlador para la gestion de clientes
//Importaciones necesarias:
import { Controller, Post, Get, Patch, Param, Body, UseGuards, ParseIntPipe, ValidationPipe } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { CreateSucursalDto } from './dto/create-sucursal.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/auth/decorators/role.decorator';

//Definicion del controlador ClientesController
@Controller('clientes')
@UseGuards(JwtAuthGuard, RoleGuard)
export class ClientesController {
    constructor(private readonly clientesService: ClientesService) {}
    
    //----------------------------------------
    //Crear un nuevo cliente (Solo Admin)
    //POST /Clientes
    //Alcance: Solo el administrador puede crear un nuevo cliente
    //----------------------------------------
    @Post()
    @Roles('ADMINISTRADOR')
    create(@Body('cliente', new ValidationPipe({ validateCustomDecorators: true })) clienteDto: CreateClienteDto,
            @Body('sucursal') sucursalDto: Partial<CreateSucursalDto>) {
        return this.clientesService.create(clienteDto, sucursalDto);
    } 

    //----------------------------------------
    //Obtener todos los clientes (Admin)
    //GET /Clientes
    //Alcance: Solo el administrador puede obtener la lista de clientes
    //----------------------------------------
    @Get()
    @Roles('ADMINISTRADOR')
    findAll() {
        return this.clientesService.findAll();
    }

    //----------------------------------------
    //Obtener una empresa por ID (Admin)
    //Con sucursales y plan
    //GET /Clientes/:id
    //Alcance: Solo el administrador puede obtener los detalles de un cliente
    //----------------------------------------
    @Get(':id')
    @Roles('ADMINISTRADOR')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.clientesService.findOne(id);
    }

    //----------------------------------------
    //Actualizar un cliente (Admin)
    //PATCH /Clientes/:id
    //Alcance: Solo el administrador puede actualizar los detalles de un cliente
    //----------------------------------------
    @Patch(':id')
    @Roles('ADMINISTRADOR')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateClienteDto: Partial<CreateClienteDto>) {
        return this.clientesService.update(id, updateClienteDto);
    }

    //----------------------------------------
    //Desactivar un cliente (Admin)
    //PATCH /Clientes/:id/desactivar
    //Alcance: Solo el administrador puede desactivar un cliente
    //----------------------------------------
    @Patch(':id/desactivar')
    @Roles('ADMINISTRADOR')
    deactivate(@Param('id', ParseIntPipe) id: number) {
        return this.clientesService.deactivate(id);
    }

    //----------------------------------------
    //Actualizar el plan de un cliente (Admin)
    //PATCH /Clientes/:id/plan
    //Alcance: Solo el administrador puede actualizar el plan de un cliente
    //----------------------------------------
    @Patch(':id/plan')
    @Roles('ADMINISTRADOR')
    updatePlan(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
        return this.clientesService.updatePlan(id, dto.id_plan, dto.nuevaFechaFin, dto);
    }
}
