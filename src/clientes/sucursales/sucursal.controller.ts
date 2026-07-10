import { Controller, Get, Post, Body, Param, ParseIntPipe, Patch, UseGuards } from '@nestjs/common';
import { CreateSucursalDto } from '../dto/create-sucursal.dto';

// Importaciones de seguridad nativas de tu proyecto
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RoleGuard } from '@/common/guards/role.guard';
import { Roles } from '@/common/decorators/role.decorator';

// Importaciones de los Casos de Uso (Capa de Aplicación)
import { CreateSucursalUseCase } from './application/create-sucursal.use-case';
import { FindAllSucursalesUseCase } from './application/find-all-sucursales.use-case';
import { FindOneSucursalUseCase } from './application/find-one-sucursal.use-case';
import { FindByClienteUseCase } from './application/find-by-cliente.use-case';
import { UpdateSucursalUseCase } from './application/update-sucursal.use-case';
import { DeactivateSucursalUseCase } from './application/deactivate-sucursal.use-case';
import { ReactivateSucursalUseCase } from './application/reactivate-sucursal.use-case';

@Controller('sucursales')
@UseGuards(JwtAuthGuard, RoleGuard) 
export class SucursalController {
    constructor(
        private readonly createSucursalUseCase: CreateSucursalUseCase,
        private readonly findAllSucursalesUseCase: FindAllSucursalesUseCase,
        private readonly findOneSucursalUseCase: FindOneSucursalUseCase,
        private readonly findByClienteUseCase: FindByClienteUseCase,
        private readonly updateSucursalUseCase: UpdateSucursalUseCase,
        private readonly deactivateSucursalUseCase: DeactivateSucursalUseCase,
        private readonly reactivateSucursalUseCase: ReactivateSucursalUseCase,
    ) {}

    //------------------------------------------
    // Crear una nueva sucursal para un cliente existente (Admin, Cliente Empresa)
    // POST /sucursales
    //------------------------------------------
    @Post()
    @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA')
    create(@Body() dto: CreateSucursalDto) {
        return this.createSucursalUseCase.execute(dto);
    }

    //------------------------------------------
    // Obtener todas las sucursales de todas las empresas (Admin, Cliente Empresa)
    // GET /sucursales
    //------------------------------------------
    @Get()
    @Roles('ADMINISTRADOR', 'SOPORTE_TECNICO', 'SOPORTE_INSITU', 'CLIENTE_EMPRESA')
    findAll() {
        return this.findAllSucursalesUseCase.execute();
    }

    //------------------------------------------
    // Obtener una sucursal por ID con sus relaciones (Admin, Cliente Empresa, Cliente Sucursal)
    // GET /sucursales/:id
    //------------------------------------------
    @Get(':id')
    @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA', 'CLIENTE_SUCURSAL')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.findOneSucursalUseCase.execute(id);
    }

    //------------------------------------------
    // Obtener las sucursales de un cliente específico (Admin)
    // GET /sucursales/cliente/:id_cliente
    //------------------------------------------
    @Get('cliente/:id_cliente')
    @Roles('ADMINISTRADOR','SOPORTE_TECNICO', 'SOPORTE_INSITU')
    findByCliente(@Param('id_cliente', ParseIntPipe) id_cliente: number) {
        return this.findByClienteUseCase.execute(id_cliente);
    }

    //------------------------------------------
    // Actualizar los datos de una sucursal (Admin, Cliente Empresa)
    // PATCH /sucursales/:id
    //------------------------------------------
    @Patch(':id')
    @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateSucursalDto>) {
        return this.updateSucursalUseCase.execute(id, dto);
    }

    //------------------------------------------
    // Desactivar una sucursal lógicamente (Admin, Cliente Empresa)
    // PATCH /sucursales/:id/desactivar
    //------------------------------------------
    @Patch(':id/desactivar')
    @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA')
    deactivate(@Param('id', ParseIntPipe) id: number) {
        return this.deactivateSucursalUseCase.execute(id);
    }

    //------------------------------------------
    // Reactivar una sucursal (Admin, Cliente Empresa)
    // PATCH /sucursales/:id/activar
    //------------------------------------------
    @Patch(':id/activar')
    @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA')
    reactivate(@Param('id', ParseIntPipe) id: number) {
        return this.reactivateSucursalUseCase.execute(id);
    }
}