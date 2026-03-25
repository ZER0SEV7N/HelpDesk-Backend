// src/equipos/equipos.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { EquiposService } from './equipos.service';
import { CreateEquipoDTO } from './dto/create-equipos.dto';
import { UpdateEquipoDto } from './dto/update-equipos.dto';

@Controller('equipos')
export class EquiposController {
  constructor(private readonly equiposService: EquiposService) {}

  // Crear un nuevo equipo
  @Post()
  create(@Body() createEquipoDto: CreateEquipoDTO) {
    return this.equiposService.create(createEquipoDto);
  }

  // Listar todos los equipos
  @Get()
  findAll() {
    return this.equiposService.findAll();
  }

  // Obtener un equipo por ID
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.equiposService.findOne(Number(id));
  }

  // Actualizar un equipo existente
  @Put(':id')
  update(@Param('id') id: number, @Body() updateEquipoDto: UpdateEquipoDto) {
    return this.equiposService.update(Number(id), updateEquipoDto);
  }

  // Eliminar un equipo
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.equiposService.remove(Number(id));
  }
}