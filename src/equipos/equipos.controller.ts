// src/equipos/equipos.controller.ts
import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Delete, 
  Body, 
  Param, 
  UseGuards, 
  ParseIntPipe, 
  Request 
} from '@nestjs/common';
import { EquiposService } from './equipos.service';
import { CreateEquipoDTO } from './dto/create-equipos.dto';
import { UpdateEquipoDto } from './dto/update-equipos.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/role.decorator';

@Controller('equipos')
@UseGuards(JwtAuthGuard, RoleGuard)
export class EquiposController {
  constructor(private readonly equiposService: EquiposService) {}

  // --------------------------------------------------------
  // 1. CREAR NUEVO EQUIPO 
  // --------------------------------------------------------
  @Post()
  @Roles('ADMINISTRADOR', 'SOPORTE_TECNICO')
  create(@Body() createEquipoDto: CreateEquipoDTO) {
    return this.equiposService.create(createEquipoDto);
  }

  // --------------------------------------------------------
  // 2. LISTAR EQUIPOS
  // --------------------------------------------------------
  @Get()
  @Roles('ADMINISTRADOR', 'SOPORTE_TECNICO', 'SOPORTE_INSITU', 'CLIENTE_EMPRESA', 'CLIENTE_SUCURSAL', 'CLIENTE_TRABAJADOR')
  findAll(@Request() req: any) {
    // req.user contiene el userId y role descifrados por tu JwtStrategy
    return this.equiposService.findAll(req.user);
  }

  // --------------------------------------------------------
  // 3. VER DETALLE DE UN EQUIPO ESPECÍFICO
  // --------------------------------------------------------
  @Get(':id')
  @Roles('ADMINISTRADOR', 'SOPORTE_TECNICO', 'SOPORTE_INSITU', 'CLIENTE_EMPRESA', 'CLIENTE_SUCURSAL', 'CLIENTE_TRABAJADOR')
  findOne(
    @Param('id', ParseIntPipe) id: number, 
    @Request() req: any
  ) {
    return this.equiposService.findOne(id, req.user);
  }

  // --------------------------------------------------------
  // 4. ACTUALIZAR DATOS DE LA COMPUTADORA
  // --------------------------------------------------------
  @Patch(':id')
  @Roles('ADMINISTRADOR', 'SOPORTE_TECNICO')
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateEquipoDto: UpdateEquipoDto,
    @Request() req: any
  ) {
    return this.equiposService.update(id, updateEquipoDto, req.user);
  }

  // --------------------------------------------------------
  // 5. DAR DE BAJA UN EQUIPO (Soft Delete)
  // --------------------------------------------------------
  @Delete(':id')
  @Roles('ADMINISTRADOR')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any
  ) {
    return this.equiposService.remove(id, req.user);
  }
}