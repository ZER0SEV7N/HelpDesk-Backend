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
import { UpdateEquipoHardwareDto } from './dto/update-equipo-hardware.dto';
import { UpdateEquipoSoftwareDto } from './dto/update-equipo-software.dto';
import { UnassignEquipoUseCase } from './application/unassign-equipo.use-case';
import { UpdateEquipoHardwareUseCase } from './application/update-equipo-hardware.use-case';
import { UpdateEquipoSoftwareUseCase } from './application/update-equipo-software.use-case';

@Controller('equipos')
@UseGuards(JwtAuthGuard, RoleGuard)
export class EquiposController {
  constructor(
    private readonly equiposService: EquiposService,
    private readonly unassignEquipoUseCase: UnassignEquipoUseCase,
    private readonly updateEquipoHardwareUseCase: UpdateEquipoHardwareUseCase,
    private readonly updateEquipoSoftwareUseCase: UpdateEquipoSoftwareUseCase, 
  ){}

  @Post()
  @Roles(
    'ADMINISTRADOR',
    'SOPORTE_TECNICO',
    'CLIENTE_EMPRESA',
    'CLIENTE_SUCURSAL',
  )
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
  @Roles(
    'ADMINISTRADOR',
    'SOPORTE_TECNICO',
    'SOPORTE_INSITU',
    'CLIENTE_EMPRESA',
    'CLIENTE_SUCURSAL',
  )
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
    @Body('id_trabajador', ParseIntPipe) id_trabajador: number,
    @Body('nombre_usuario') nombre_usuario: string,
    @Body('area') area: string,
    @Body('id_sucursal') id_sucursal: number,
    @Request() req: Request & { user: JwtPayload },
  ) {
    return this.equiposService.assignToWorker(
      id,
      id_trabajador,
      nombre_usuario,
      area,
      id_sucursal,
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
    return this.unassignEquipoUseCase.execute(id, req.user);
  }

  // Editar un componente de HARDWARE instalado en el equipo
  // PATCH /equipos/:id/hardware/:idRegistro
  @Patch(':id/hardware/:idRegistro')
  @Roles('SOPORTE_TECNICO')
  updateHardware(
    @Param('id', ParseIntPipe) id: number,
    @Param('idRegistro', ParseIntPipe) idRegistro: number,
    @Body() dto: UpdateEquipoHardwareDto,
    @Request() req: Request & { user: JwtPayload },
  ) {
    return this.updateEquipoHardwareUseCase.execute(
      id,
      idRegistro,
      dto,
      req.user,
    );
  }

  // Editar un componente de SOFTWARE instalado en el equipo
  // PATCH /equipos/:id/software/:idInstalacion
  @Patch(':id/software/:idInstalacion')
  @Roles('SOPORTE_TECNICO')
  updateSoftware(
    @Param('id', ParseIntPipe) id: number,
    @Param('idInstalacion', ParseIntPipe) idInstalacion: number,
    @Body() dto: UpdateEquipoSoftwareDto,
    @Request() req: Request & { user: JwtPayload },
  ) {
    return this.updateEquipoSoftwareUseCase.execute(
      id,
      idInstalacion,
      dto,
      req.user,
    );
  }
}
