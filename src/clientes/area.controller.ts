import { Controller, Get, Post, Body, Patch, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { AreaService } from './area.service';
import { CreateAreaDto } from './dto/create-area.dto';

// Importaciones de seguridad
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/role.decorator';

@Controller('areas')
@UseGuards(JwtAuthGuard, RoleGuard)
export class AreaController {
  constructor(private readonly areaService: AreaService) {}

  //-----------------------------------------------------------------
  //Crear un nuevo área para una sucursal existente (Admin, Cliente Empresa)
  //POST /areas
  //Alcance: El administrador y el cliente empresa pueden crear un nuevo área para una sucursal existente
  //-----------------------------------------------------------------
  @Post()
  @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA')
  create(@Body() dto: CreateAreaDto) {
    return this.areaService.create(dto);
  }

  //-----------------------------------------------------------------
  //Obtener un área por ID (Admin, Cliente Empresa, Cliente Sucursal)
  //GET /areas/:id
  //Alcance: El administrador, el cliente empresa y el cliente sucursal pueden obtener los detalles de un área por ID
  //-----------------------------------------------------------------
  @Get(':id')
  @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA', 'CLIENTE_SUCURSAL')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.areaService.findOne(id);
  }

  //-----------------------------------------------------------------
  //Obtener las áreas de una sucursal especifica (Admin, Cliente Empresa, Cliente Sucursal)
  //GET /areas/sucursal/:id_sucursal
  //Alcance: El administrador, el cliente empresa y el cliente sucursal pueden obtener las áreas de una sucursal especifica
  //-----------------------------------------------------------------
  @Get('sucursal/:id_sucursal')
  @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA', 'CLIENTE_SUCURSAL')
  findBySucursal(@Param('id_sucursal', ParseIntPipe) id_sucursal: number) {
    return this.areaService.findBySucursal(id_sucursal);
  }

  //-----------------------------------------------------------------
  //Actualizar los datos de un área (Admin, Cliente Empresa)
  //PATCH /areas/:id
  //Alcance: El administrador y el cliente empresa pueden actualizar los detalles de un área por ID
  //-----------------------------------------------------------------
  @Patch(':id')
  @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateAreaDto) {
    return this.areaService.update(id, dto);
  }

  //-----------------------------------------------------------------
  //Desactivar un área (Admin, Cliente Empresa)
  //PATCH /areas/:id/desactivar
  //Alcance: El administrador y el cliente empresa pueden desactivar un área por ID
  //-----------------------------------------------------------------
  @Patch(':id/desactivar')
  @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA')
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.areaService.deactivate(id);
  }
  
  //-----------------------------------------------------------------
  //Reactivar un área (Admin, Cliente Empresa)
  //PATCH /areas/:id/activar
  //Alcance: El administrador y el cliente empresa pueden reactivar un área por ID
  //-----------------------------------------------------------------
  @Patch(':id/activar')
  @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA')
  reactivate(@Param('id', ParseIntPipe) id: number) {
    return this.areaService.reactivate(id);
  }

  //-----------------------------------------------------------------
  //Obtener todas las áreas de todas las sucursales (Admin, Cliente Empresa, Cliente Sucursal)
  //GET /areas
  //Alcance: El administrador, el cliente empresa y el cliente sucursal pueden obtener la lista de todas las áreas de todas las sucursales
  //-----------------------------------------------------------------
  @Get()
  @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA', 'CLIENTE_SUCURSAL')
  findAll() {
  return this.areaService.findAll();
}

}