import { Controller, Get, Post, Body, Patch, Param, ParseIntPipe, UseGuards, ValidationPipe } from '@nestjs/common';
import { CreateClienteDto } from '../dto/create-cliente.dto';
import { CreateSucursalDto } from '../dto/create-sucursal.dto';
import { UpdateContractDto } from '../dto/update-contract.dto';

// Importaciones de seguridad nativas de tu proyecto
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RoleGuard } from '@/common/guards/role.guard';
import { Roles } from '@/common/decorators/role.decorator';

// Importaciones de los Casos de Uso (Capa de Aplicación)
import { CreateClienteUseCase } from './application/create-cliente.use-case';
import { FindAllClientesUseCase } from './application/find-all-clientes.use-case';
import { FindOneClienteUseCase } from './application/find-one-cliente.use-case';
import { UpdateClienteUseCase } from './application/update-cliente.use-case';
import { UpdateContractUseCase } from './application/update-contract.use-case';
import { DeactivateClienteUseCase } from './application/deactivate-cliente.use-case';
import { ReactivateClienteUseCase } from './application/reactivate-cliente.use-case';

@Controller('clientes')
@UseGuards(JwtAuthGuard, RoleGuard)
export class ClientesController {
  constructor(
    private readonly createClienteUseCase: CreateClienteUseCase,
    private readonly findAllClientesUseCase: FindAllClientesUseCase,
    private readonly findOneClienteUseCase: FindOneClienteUseCase,
    private readonly updateClienteUseCase: UpdateClienteUseCase,
    private readonly updateContractUseCase: UpdateContractUseCase,
    private readonly deactivateClienteUseCase: DeactivateClienteUseCase,
    private readonly reactivateClienteUseCase: ReactivateClienteUseCase,
  ) {}

  //-----------------------------------------------------------------
  // Crear un nuevo cliente (Solo ADMINISTRADOR)
  // POST /clientes
  //-----------------------------------------------------------------
  @Post()
  @Roles('ADMINISTRADOR')
  async create(
    @Body('cliente', new ValidationPipe({ validateCustomDecorators: true })) clienteDto: CreateClienteDto,
    @Body('sucursal') sucursalDto: Partial<CreateSucursalDto>,
  ) {
    return this.createClienteUseCase.execute(clienteDto, sucursalDto);
  }

  //-----------------------------------------------------------------
  // Obtener todos los clientes/empresa (Solo ADMINISTRADOR)
  // GET /clientes
  //-----------------------------------------------------------------
  @Get()
  @Roles('ADMINISTRADOR')
  findAll() {
    return this.findAllClientesUseCase.execute();
  }

  //-----------------------------------------------------------------
  // Obtener detalles de un cliente/empresa por ID (Admin, Cliente Empresa, Cliente Sucursal)
  // GET /clientes/:id
  //-----------------------------------------------------------------
  @Get(':id')
  @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA', 'CLIENTE_SUCURSAL')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.findOneClienteUseCase.execute(id);
  }

  //-----------------------------------------------------------------
  // Actualizar datos básicos de un cliente (Solo ADMINISTRADOR)
  // PATCH /clientes/:id
  //-----------------------------------------------------------------
  @Patch(':id')
  @Roles('ADMINISTRADOR')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateClienteDto>) {
    return this.updateClienteUseCase.execute(id, dto);
  }

  //-----------------------------------------------------------------
  // Actualizar/Renovar el contrato de un cliente (Solo ADMINISTRADOR)
  // PATCH /clientes/contract/:id
  //-----------------------------------------------------------------
  @Patch('contract/:id')
  @Roles('ADMINISTRADOR')
  updateContract(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateContractDto) {
    return this.updateContractUseCase.execute(id, dto);
  }

  //-----------------------------------------------------------------
  // Desactivar un cliente y toda su infraestructura en cascada (Solo ADMINISTRADOR)
  // PATCH /clientes/:id/desactivar
  //-----------------------------------------------------------------
  @Patch(':id/desactivar')
  @Roles('ADMINISTRADOR')
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.deactivateClienteUseCase.execute(id);
  }

  //-----------------------------------------------------------------
  // Reactivar un cliente y toda su infraestructura en cascada (Solo ADMINISTRADOR)
  // PATCH /clientes/:id/activar
  //-----------------------------------------------------------------
  @Patch(':id/activar')
  @Roles('ADMINISTRADOR')
  reactivate(@Param('id', ParseIntPipe) id: number) {
    return this.reactivateClienteUseCase.execute(id);
  }
}