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
  Request,
} from '@nestjs/common';
import { EquiposService } from './equipos.service';
import { CreateEquipoDTO } from './dto/create-equipos.dto';
import { UpdateEquipoDto } from './dto/update-equipos.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RoleGuard } from '../common/guards/role.guard';
import { Roles } from '../common/decorators/role.decorator';
import { JwtPayload } from '../common/guards/jwt-auth.guard';
import { AssignEquipoDTO } from './dto/assign-equipio.dto';

@Controller('equipos')
@UseGuards(JwtAuthGuard, RoleGuard)
export class EquiposController {
  constructor(private readonly equiposService: EquiposService) {}

  @Post()
  @Roles('ADMINISTRADOR', 'SOPORTE_TECNICO')
  create(@Body() createEquipoDto: CreateEquipoDTO) {
    return this.equiposService.create(createEquipoDto);
  }

  @Get()
  @Roles(
    'ADMINISTRADOR',
    'SOPORTE_TECNICO',
    'SOPORTE_INSITU',
    'CLIENTE_EMPRESA',
    'CLIENTE_SUCURSAL',
    'CLIENTE_TRABAJADOR',
  )
  findAll(@Request() req: Request & { user: JwtPayload }) {
    return this.equiposService.findAll(req.user);
  }

  @Get(':id')
  @Roles(
    'ADMINISTRADOR',
    'SOPORTE_TECNICO',
    'SOPORTE_INSITU',
    'CLIENTE_EMPRESA',
    'CLIENTE_SUCURSAL',
    'CLIENTE_TRABAJADOR',
  )
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: Request & { user: JwtPayload },
  ) {
    return this.equiposService.findOne(id, req.user);
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR', 'SOPORTE_TECNICO')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEquipoDto: UpdateEquipoDto,
    @Request() req: Request & { user: JwtPayload },
  ) {
    return this.equiposService.update(id, updateEquipoDto, req.user);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: Request & { user: JwtPayload },
  ) {
    return this.equiposService.remove(id, req.user);
  }

  @Patch(':id/asignar')
  @Roles(
    'ADMINISTRADOR',
    'SOPORTE_TECNICO',
    'SOPORTE_INSITU',
    'CLIENTE_EMPRESA',
    'CLIENTE_SUCURSAL',
  )
  asignarEquipo(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignEquipoDTO,
    @Request() req: Request & { user: JwtPayload },
  ) {
    return this.equiposService.assignToWorker(
      id,
      dto.nombre_usuario,
      dto.area,
      dto.id_sucursal,
      req.user,
    );
  }

  @Patch(':id/liberar')
  @Roles(
    'ADMINISTRADOR',
    'SOPORTE_TECNICO',
    'SOPORTE_INSITU',
    'CLIENTE_EMPRESA',
    'CLIENTE_SUCURSAL',
  )
  liberarEquipo(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: Request & { user: JwtPayload },
  ) {
    return this.equiposService.unassignFromWorker(id, req.user);
  }
}
