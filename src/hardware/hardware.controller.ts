import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { HardwareService } from './hardware.service';
import { CreateHardwareDto } from './dto/create-hardware.dto';
import { UpdateHardwareDto } from './dto/update-hardware.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/auth/decorators/role.decorator';

//Controlador para manejar las rutas relacionadas con el hardware, protegido por JWT y roles
@Controller('hardware')
@UseGuards(JwtAuthGuard, RoleGuard)
export class HardwareController {
  constructor(private readonly hardwareService: HardwareService) {}

  //Post: /hardware
  //Crea un nuevo hardware, solo accesible para ADMINISTRADOR y SOPORTE_TECNICO
  @Post()
  @Roles('ADMINISTRADOR', 'SOPORTE_TECNICO')
  create(@Body() createHardwareDto: CreateHardwareDto) {
    return this.hardwareService.create(createHardwareDto);
  }

  //Get: /hardware
  //Obtiene la lista de hardware, accesible para ADMINISTRADOR, SOPORTE_TECNICO y SOPORTE_INSITU
  @Get()
  @Roles('ADMINISTRADOR', 'SOPORTE_TECNICO', 'SOPORTE_INSITU')
  findAll() {
    return this.hardwareService.findAll();
  }

  //Get: /hardware/:id
  //Obtiene un hardware por su ID, accesible para ADMINISTRADOR, SOPORTE_TECNICO y SOPORTE_INSITU
  @Get(':id')
  @Roles('ADMINISTRADOR', 'SOPORTE_TECNICO', 'SOPORTE_INSITU')
  findOne(@Param('id') id: string) {
    return this.hardwareService.findOne(+id);
  }

  //Patch: /hardware/:id
  //Actualiza un hardware existente, solo accesible para ADMINISTRADOR y SOPORTE_TECNICO
  @Patch(':id')
  @Roles('ADMINISTRADOR', 'SOPORTE_TECNICO')
  update(@Param('id') id: string, @Body() updateHardwareDto: UpdateHardwareDto) {
    return this.hardwareService.update(+id, updateHardwareDto);
  }

  //Delete: /hardware/:id
  //Elimina un hardware (lo marca como inactivo), solo accesible para ADMINISTRADOR
  @Delete(':id')
  @Roles('ADMINISTRADOR')
  remove(@Param('id') id: string) {
    return this.hardwareService.remove(+id);
  }
  
  @Post(':id/instalar')
  @Roles('ADMINISTRADOR', 'SOPORTE_TECNICO', 'SOPORTE_INSITU')
  instalarPieza(
      @Param('id', ParseIntPipe) id_hardware: number,
      @Body('id_equipo', ParseIntPipe) id_equipo: number,
      @Body('descripcion') descripcion: string,
      @Body('serie') serie: string,
      @Body('proveedor') proveedor: string,
  ) {
      return this.hardwareService.installHardware(id_hardware, id_equipo, descripcion, serie, proveedor);
  }
}
