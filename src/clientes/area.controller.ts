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

  @Post()
  @Roles('ADMINISTRADOR', 'SOPORTE_TECNICO', 'CLIENTE_EMPRESA', 'CLIENTE_SUCURSAL')
  create(@Body() dto: CreateAreaDto) {
    return this.areaService.create(dto);
  }

  @Get(':id')
  @Roles('ADMINISTRADOR', 'SOPORTE_TECNICO', 'CLIENTE_EMPRESA', 'CLIENTE_SUCURSAL')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.areaService.findOne(id);
  }

  @Get('sucursal/:id_sucursal')
  @Roles('ADMINISTRADOR', 'SOPORTE_TECNICO', 'CLIENTE_EMPRESA', 'CLIENTE_SUCURSAL', 'CLIENTE_TRABAJADOR')
  findBySucursal(@Param('id_sucursal', ParseIntPipe) id_sucursal: number) {
    return this.areaService.findBySucursal(id_sucursal);
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR', 'SOPORTE_TECNICO', 'CLIENTE_EMPRESA', 'CLIENTE_SUCURSAL')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateAreaDto) {
    return this.areaService.update(id, dto);
  }

  // 🚀 TU MÉTODO PERSONALIZADO: Desactivar área
  @Patch(':id/desactivar')
  @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA', 'CLIENTE_SUCURSAL')
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.areaService.deactivate(id);
  }
  
  @Get()
  @Roles('ADMINISTRADOR', 'SOPORTE_TECNICO')
  findAll() {
  return this.areaService.findAll();
}

}