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
import { CreateEquipoDTO } from './dto/create-equipos.dto';
import { UpdateEquipoDto } from './dto/update-equipos.dto';
import { AsignarEquipoDto } from './dto/asignar-equipo.dto';
import { UpdateEquipoHardwareDto } from './dto/update-equipo-hardware.dto';
import { UpdateEquipoSoftwareDto } from './dto/update-equipo-software.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RoleGuard } from '../common/guards/role.guard';
import { Roles } from '../common/decorators/role.decorator';
import { JwtPayload } from '../common/guards/jwt-auth.guard';
//Casos de uso
import { CreateEquipoUseCase } from './application/create-equipo.use-case';
import { UpdateEquipoUseCase } from './application/update-equipo.use-case';
import { FindOneEquipoUseCase } from './application/find-one-equipo.use-case';
import { FindAllEquiposUseCase } from './application/find-all-equipos.use-case';
import { UpdateEquipoHardwareUseCase } from './application/update-equipo-hardware.use-case';
import { UpdateEquipoSoftwareUseCase } from './application/update-equipo-software.use-case';
import { RemoveEquipoUseCase } from './application/remove-equipo.use-case';
import { AssignEquipoUseCase } from './application/assign-equipo.use-case';
import { UnassignEquipoUseCase } from './application/unassign-equipo.use-case';

@Controller('equipos')
@UseGuards(JwtAuthGuard, RoleGuard)
export class EquiposController {
  constructor(
    private readonly createEquipoUseCase: CreateEquipoUseCase,
    private readonly updateEquipoUseCase: UpdateEquipoUseCase,
    private readonly removeEquipoUseCase: RemoveEquipoUseCase,
    private readonly findAllEquiposUseCase: FindAllEquiposUseCase,
    private readonly findOneEquipoUseCase: FindOneEquipoUseCase,
    private readonly updateEquipoHardwareUseCase: UpdateEquipoHardwareUseCase,
    private readonly updateEquipoSoftwareUseCase: UpdateEquipoSoftwareUseCase,
    private readonly assignEquipoUseCase: AssignEquipoUseCase,
    private readonly unassignEquipoUseCase: UnassignEquipoUseCase,
  ) {}

  @Post()
  @Roles('ADMINISTRADOR', 'CLIENTE_SUCURSAL')
  create(@Body() createEquipoDto: CreateEquipoDTO) {
    return this.createEquipoUseCase.execute(createEquipoDto);
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
    return this.findAllEquiposUseCase.execute(req.user);
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
    return this.findOneEquipoUseCase.execute(id, req.user);
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR', 'SOPORTE_TECNICO')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEquipoDto: UpdateEquipoDto,
    @Request() req: Request & { user: JwtPayload },
  ) {
    return this.updateEquipoUseCase.execute(id, updateEquipoDto, req.user);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: Request & { user: JwtPayload },
  ) {
    return this.removeEquipoUseCase.execute(id, req.user);
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
    @Body() dto: AsignarEquipoDto,
    @Request() req: Request & { user: JwtPayload },
  ) {
    return this.assignEquipoUseCase.execute(
      id,
      dto.id_trabajador,
      dto.area,
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
    return this.updateEquipoHardwareUseCase.execute(id, idRegistro, dto, req.user);
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
    return this.updateEquipoSoftwareUseCase.execute(id, idInstalacion, dto, req.user);
  }
}
