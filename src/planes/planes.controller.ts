import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';  
import { PlanesService } from './planes.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { RoleGuard } from '../auth/guards/role.guard'; //Guard para roles
import { Roles } from '../auth/decorators/role.decorator'; //Decorador para roles
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; //Guard para JWT

//Controlador Planes
@Controller('planes')
export class PlanesController {
  constructor(private readonly planesService: PlanesService) {}

  /*GET /planes
  Publico: Lista de todos los planes y precios para mostrar en landing/pricing */
  @Get()
  findAll() {
    return this.planesService.findAll();
  }

  /** *GET /planes/:id
   * PÚBLICO: Ver detalle de un plan específico
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.planesService.findOne(+id);
  }

  /** *POST /planes
   * PROTEGIDO: Solamente el administrador puede crear un nuevo plan
   */
  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN')
  create(@Body() createPlanDto: CreatePlanDto) {
    return this.planesService.create(createPlanDto);
  }

  /** * PATCH /planes/:id
   * PROTEGIDO: Solo el Administrador puede cambiar precios o límites
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMINISTRADOR')
  update(@Param('id') id: string, @Body() updatePlanDto: UpdatePlanDto) {
    return this.planesService.update(+id, updatePlanDto);
  }

  /** * DELETE /planes/:id
   * PROTEGIDO: Solo el Administrador puede eliminar planes obsoletos
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMINISTRADOR')
  remove(@Param('id') id: string) {
    return this.planesService.remove(+id);
  }
}