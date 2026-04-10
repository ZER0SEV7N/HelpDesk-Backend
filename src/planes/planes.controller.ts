import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  ParseIntPipe,
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
    return this.planesService.findAll(true);
  }

  @Get('admin/list')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMINISTRADOR')
  findAllForAdmin() {
    return this.planesService.findAll(false); // false = trae todos
  }

  /** *GET /planes/:id
   * PÚBLICO: Ver detalle de un plan específico
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.planesService.findOne(id);
  }

  /** *POST /planes
   * PROTEGIDO: Solamente el administrador puede crear un nuevo plan
   */
  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMINISTRADOR')
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

  /**
   * PATCH /planes/:id/desactivar
   * PROTEGIDO: Archiva el plan (Soft Delete). No se mostrará a nuevos clientes.
   */
  @Patch(':id/desactivar')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMINISTRADOR')
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.planesService.deactivate(id);
  }

  /**
   * PATCH /planes/:id/activar
   * PROTEGIDO: Reactiva un plan previamente archivado.
   */
  @Patch(':id/activar')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMINISTRADOR')
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.planesService.activate(id);
  }
}