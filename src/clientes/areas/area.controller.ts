import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RoleGuard } from '@/common/guards/role.guard';
import { Roles } from '@/common/decorators/role.decorator';
import { CreateAreaUseCase } from "./application/create-area.use-case";
import { FindOneAreaUseCase } from "./application/find-one-area.use-case";
import { FindBySucursalUseCase } from "./application/find-by-sucursal-use-case";
import { UpdateAreaUseCase } from "./application/update-area.use-case";
import { DeactivateAreaUseCase } from "./application/deactivate-area.use-case";
import { CreateAreaDto } from "../dto/create-area.dto";

@Controller('areas')
@UseGuards(JwtAuthGuard, RoleGuard)
export class AreaController {
  constructor(
    private readonly createAreaUseCase: CreateAreaUseCase,
    private readonly findOneAreaUseCase: FindOneAreaUseCase,
    private readonly findBySucursalUseCase: FindBySucursalUseCase,
    private readonly updateAreaUseCase: UpdateAreaUseCase,
    private readonly deactivateAreaUseCase: DeactivateAreaUseCase,
  ) {}

  @Post()
  @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA')
  create(@Body() dto: CreateAreaDto) {
    return this.createAreaUseCase.execute(dto);
  }

  @Get(':id')
  @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA', 'CLIENTE_SUCURSAL')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.findOneAreaUseCase.execute(id);
  }

  @Get('sucursal/:id_sucursal')
  @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA', 'CLIENTE_SUCURSAL')
  findBySucursal(@Param('id_sucursal', ParseIntPipe) id_sucursal: number) {
    return this.findBySucursalUseCase.execute(id_sucursal);
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateAreaDto>) {
    return this.updateAreaUseCase.execute(id, dto);
  }

  @Patch(':id/desactivar')
  @Roles('ADMINISTRADOR', 'CLIENTE_EMPRESA')
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.deactivateAreaUseCase.execute(id);
  }
}