// src/software/software.controller.ts
// Controlador para la gestión de Software
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SoftwareService } from './software.service';
import { CreateSoftwareDto } from './dto/create-software.dto';
import { UpdateSoftwareDto } from './dto/update-software.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../../auth/guards/role.guard';
import { Roles } from '../../auth/decorators/role.decorator';

@Controller('software') // Prefijo de ruta para todas las solicitudes de este controlador
@UseGuards(JwtAuthGuard, RoleGuard)
export class SoftwareController {
  constructor(private readonly softwareService: SoftwareService) {}

  // Endpoint para crear un nuevo software
  // POST /software
  @Post()
  @Roles('ADMINISTRADOR', 'SOPORTE_TECNICO')
  create(@Body() createSoftwareDto: CreateSoftwareDto) {
    // Llama al servicio para crear el registro usando el DTO recibido en el body
    return this.softwareService.create(createSoftwareDto);
  }

  // Endpoint para obtener todos los registros de software
  // GET /software
  @Get()
  @Roles('ADMINISTRADOR', 'SOPORTE_TECNICO', 'SOPORTE_INSITU')
  findAll() {
    // Llama al servicio que retorna un arreglo con todos los registros
    return this.softwareService.findAll();
  }

  // Endpoint para obtener un software específico por ID
  // GET /software/:id
  @Get(':id')
  @Roles('ADMINISTRADOR', 'SOPORTE_TECNICO', 'SOPORTE_INSITU')
  findOne(@Param('id', ParseIntPipe) id: number) {
    // ParseIntPipe asegura que 'id' sea un número
    // Llama al servicio que busca un software por su ID
    return this.softwareService.findOne(id);
  }

  // Endpoint para actualizar un registro de software
  // PATCH /software/:id
  @Patch(':id')
  @Roles('ADMINISTRADOR', 'SOPORTE_TECNICO')
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateSoftwareDto: UpdateSoftwareDto
  ) {
    // Llama al servicio para actualizar el software con los datos del DTO
    return this.softwareService.update(id, updateSoftwareDto);
  }

  // Endpoint para eliminar un software por ID
  // DELETE /software/:id
  @Delete(':id')
  @Roles('ADMINISTRADOR')
  remove(@Param('id', ParseIntPipe) id: number) {
    // Llama al servicio que elimina el software y devuelve un mensaje de confirmación
    return this.softwareService.remove(id);
  }
  //--------------------------------------------------------
  // ASIGNAR/INSTALAR SOFTWARE EN UN EQUIPO
  // POST http://localhost:3000/software/1/instalar
  //--------------------------------------------------------
  @Post(':id/instalar')
  @Roles('ADMINISTRADOR', 'SOPORTE_TECNICO', 'SOPORTE_INSITU')
  instalarSoftware(
      @Param('id', ParseIntPipe) id_software: number,
      @Body('id_equipo', ParseIntPipe) id_equipo: number,
      @Body('licencia_asignada') licencia_asignada: string,
      @Body('observaciones') observaciones: string,
  ) {
      return this.softwareService.installSoftware(id_software, id_equipo, licencia_asignada, observaciones);
  }
}