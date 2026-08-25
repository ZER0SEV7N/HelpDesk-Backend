import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CreateCitaUseCase } from './application/create-cita.use-case';
import { CreateCitaDto } from './dto/create-cita-dto';
import { Roles } from '@/common/decorators/role.decorator';
import { ListCitaUseCase } from './application/list-cita.use-case';
import { FindOneCitaUseCase } from './application/find-one-cita.use-case';
import { RelocateCitaDto } from './dto/relocate-cita.dto';
import { RelocateCitaUseCase } from './application/relocate-cita.use-case';
import { UpdateCitaDto } from './dto/update-cita-dto';
import { UpdateCitaUseCase } from './application/update-cita.use-case';
import { AddTicketsToCitaDto } from './dto/add-tickets-to-cita.dto';
import { AddTicketsToCitaUseCase } from './application/add-tickets-to-cita.use-case';

@Controller('citas')
export class CitasController {
  constructor(
    private readonly createCitaUseCase: CreateCitaUseCase,
    private readonly listCitaUseCase: ListCitaUseCase,
    private readonly findOneCitaUseCase: FindOneCitaUseCase,
    private readonly relocateCitaUseCase: RelocateCitaUseCase,
    private readonly updateCitaUseCase: UpdateCitaUseCase,
    private readonly addTicketsToCitaUseCase: AddTicketsToCitaUseCase,
  ) {}

  @Get()
  @Roles(
    'ADMINISTRADOR',
    'SOPORTE_INSITU',
    'CLIENTE_EMPRESA',
    'CLIENTE_SUCURSAL',
  )
  findAll() {
    return this.listCitaUseCase.execute();
  }

  @Get('/:id')
  @Roles(
    'SOPORTE_INSITU',
    'CLIENTE_EMPRESA',
    'CLIENTE_SUCURSAL',
    'CLIENTE_TRABAJADOR',
  )
  findOne(@Param('id') id: number) {
    return this.findOneCitaUseCase.execute(id);
  }

  @Post('/')
  @Roles('ADMINISTRADOR', 'SOPORTE_INSITU')
  create(@Body() createCitaDto: CreateCitaDto) {
    return this.createCitaUseCase.execute(createCitaDto);
  }

  @Post('/relocate/:id')
  @Roles('ADMINISTRADOR', 'SOPORTE_INSITU')
  relocateCita(
    @Param('id') id_cita_actual: number,
    @Body() dto: RelocateCitaDto,
  ) {
    return this.relocateCitaUseCase.execute(dto, id_cita_actual);
  }

  @Patch('/:id')
  @Roles('ADMINISTRADOR', 'SOPORTE_INSITU')
  update(@Param('id') id_cita_actual: number, @Body() dto: UpdateCitaDto) {
    return this.updateCitaUseCase.execute(id_cita_actual, dto);
  }

  @Post('/add-tickets/:id')
  @Roles('ADMINISTRADOR', 'SOPORTE_INSITU')
  addTicketsToCita(
    @Param('id') id_cita_actual: number,
    @Body() dto: AddTicketsToCitaDto,
  ) {
    return this.addTicketsToCitaUseCase.execute(id_cita_actual, dto);
  }
}
