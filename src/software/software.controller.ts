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
} from '@nestjs/common';
import { SoftwareService } from './software.service';
import { CreateSoftwareDto } from './dto/create-software.dto';
import { UpdateSoftwareDto } from './dto/update-software.dto';

@Controller('software') // Prefijo de ruta para todas las solicitudes de este controlador
export class SoftwareController {
  constructor(private readonly softwareService: SoftwareService) {}

  // Endpoint para crear un nuevo software
  // POST /software
  @Post()
  create(@Body() createSoftwareDto: CreateSoftwareDto) {
    // Llama al servicio para crear el registro usando el DTO recibido en el body
    return this.softwareService.create(createSoftwareDto);
  }

  // Endpoint para obtener todos los registros de software
  // GET /software
  @Get()
  findAll() {
    // Llama al servicio que retorna un arreglo con todos los registros
    return this.softwareService.findAll();
  }

  // Endpoint para obtener un software específico por ID
  // GET /software/:id
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    // ParseIntPipe asegura que 'id' sea un número
    // Llama al servicio que busca un software por su ID
    return this.softwareService.findOne(id);
  }

  // Endpoint para actualizar un registro de software
  // PATCH /software/:id
  @Patch(':id')
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
  remove(@Param('id', ParseIntPipe) id: number) {
    // Llama al servicio que elimina el software y devuelve un mensaje de confirmación
    return this.softwareService.remove(id);
  }
}