import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RoleGuard } from '@/common/guards/role.guard';
import { Roles } from '@/common/decorators/role.decorator';
import { CreateAreaUseCase } from "./application/create-area.use-case";
import { FindOneAreaUseCase } from "./application/find-one-area.use-case";
import { FindBySucursalUseCase } from "./application/find-by-sucursal-use-case";
import { UpdateAreaUseCase } from "./application/update-area.use-case";
import { DeactivateAreaUseCase } from "./application/deactivate-area.use-case";
import { CreateAreaDto } from "../dto/create-area.dto";

@Controller('areas')
@UseGuards(JwtAuthGuard, RoleGuard)
export class AreaController {
  constructor(
    private readonly createAreaUseCase: CreateAreaUseCase,
    private readonly findOneAreaUseCase: FindOneAreaUseCase,
    private readonly findBySucursalUseCase: FindBySucursalUseCase,
    private readonly updateAreaUseCase: UpdateAreaUseCase,
    private readonly deactivateAreaUseCase: DeactivateAreaUseCase,
  ) {}

  //-----------------------------------------------------------------
  //Crear un nuevo área para una sucursal existente (Admin, Cliente Empresa)
  //POST /areas
  //Alcance: El administrador y el cliente empresa pueden crear un nuevo área para una sucursal existente
  //-----------------------------------------------------------------
  @Post()
  @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA')
  create(@Body() dto: CreateAreaDto) {
    return this.createAreaUseCase.execute(dto);
  }

  //-----------------------------------------------------------------
  //Obtener un área por ID (Admin, Cliente Empresa, Cliente Sucursal)
  //GET /areas/:id
  //Alcance: El administrador, el cliente empresa y el cliente sucursal pueden obtener los detalles de un área por ID
  //-----------------------------------------------------------------
  @Get(':id')
  @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA', 'CLIENTE_SUCURSAL')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.findOneAreaUseCase.execute(id);
  }

  //-----------------------------------------------------------------
  //Obtener las áreas de una sucursal especifica (Admin, Cliente Empresa, Cliente Sucursal)
  //GET /areas/sucursal/:id_sucursal
  //Alcance: El administrador, el cliente empresa y el cliente sucursal pueden obtener las áreas de una sucursal especifica
  //-----------------------------------------------------------------
  @Get('sucursal/:id_sucursal')
  @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA', 'CLIENTE_SUCURSAL')
  findBySucursal(@Param('id_sucursal', ParseIntPipe) id_sucursal: number) {
    return this.findBySucursalUseCase.execute(id_sucursal);
  }

  //-----------------------------------------------------------------
  //Actualizar los datos de un área (Admin, Cliente Empresa)
  //PATCH /areas/:id
  //Alcance: El administrador y el cliente empresa pueden actualizar los detalles de un área por ID
  //-----------------------------------------------------------------
  @Patch(':id')
  @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateAreaDto>) {
    return this.updateAreaUseCase.execute(id, dto);
  }

  //-----------------------------------------------------------------
  //Desactivar un área (Admin, Cliente Empresa)
  //PATCH /areas/:id/desactivar
  //Alcance: El administrador y el cliente empresa pueden desactivar un área por ID
  //-----------------------------------------------------------------
  @Patch(':id/desactivar')
  @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA')
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.deactivateAreaUseCase.execute(id);
  }
}