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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('planes')
export class PlanesController {
  constructor(private readonly planesService: PlanesService) {}

  /** Listar todos los planes y precios (público, para mostrar en landing/pricing) */
  @Get()
  findAll() {
    return this.planesService.findAll();
  }

  /** Ver un plan por ID (público) */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.planesService.findOne(+id);
  }

  /** Crear plan (protegido) */
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createPlanDto: CreatePlanDto) {
    return this.planesService.create(createPlanDto);
  }

  /** Actualizar plan (protegido) */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updatePlanDto: UpdatePlanDto) {
    return this.planesService.update(+id, updatePlanDto);
  }

  /** Eliminar plan (protegido) */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.planesService.remove(+id);
  }
}
