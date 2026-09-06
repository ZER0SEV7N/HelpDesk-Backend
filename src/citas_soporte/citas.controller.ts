import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CreateCitaUseCase } from './application/create-cita.use-case';
import { CreateCitaDto } from './dto/create-cita-dto';
import { Roles } from '@/common/decorators/role.decorator';
import { FindAllCitaUseCase } from './application/find-all-cita.use-case';
import { FindOneCitaUseCase } from './application/find-one-cita.use-case';
import { RelocateCitaDto } from './dto/relocate-cita.dto';
import { RelocateCitaUseCase } from './application/relocate-cita.use-case';
import { UpdateCitaDto } from './dto/update-cita-dto';
import { UpdateCitaUseCase } from './application/update-cita.use-case';
import { AddTicketsToCitaDto } from './dto/add-tickets-to-cita.dto';
import { AddTicketsToCitaUseCase } from './application/add-tickets-to-cita.use-case';
import { StartCitaUseCase } from './application/start-cita.use-case';
import { CompleteCitaUseCase } from './application/complete-cita.use-case';
import { CancelCitaUseCase } from './application/cancel-cita.use-case';
import { CancelCitaDto } from './dto/cancel-cita.dto';
import { CompleteCitaDto } from './dto/complete-cita.dto';
import type { JwtPayload } from '@/common/guards/jwt-auth.guard';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RoleGuard } from '@/common/guards/role.guard';
import { CronogramaCitaUseCase } from './application/cronograma-cita.use-case';

@Controller('citas')
@UseGuards(JwtAuthGuard, RoleGuard)
export class CitasController {
  constructor(
    private readonly createCitaUseCase: CreateCitaUseCase,
    private readonly cronogramaCitaUseCase: CronogramaCitaUseCase,
    private readonly listCitaUseCase: FindAllCitaUseCase,
    private readonly findOneCitaUseCase: FindOneCitaUseCase,
    private readonly relocateCitaUseCase: RelocateCitaUseCase,
    private readonly updateCitaUseCase: UpdateCitaUseCase,
    private readonly addTicketsToCitaUseCase: AddTicketsToCitaUseCase,
    private readonly startCitaUseCase: StartCitaUseCase,
    private readonly completeCitaUseCase: CompleteCitaUseCase,
    private readonly cancelCitaUseCase: CancelCitaUseCase,
  ) {}

  @Get()
  @Roles('ADMINISTRADOR', 'SOPORTE_INSITU')
  findAll(@Request() req: Request & { user: JwtPayload }) {
    // Se agrega el parámetro user de tipo JwtPayload para obtener la información del usuario autenticado
    return this.listCitaUseCase.execute(req.user);
  }

  @Get('/cronograma')
  @Roles(
    'ADMINISTRADOR',
    'SOPORTE_INSITU',
    'CLIENTE_EMPRESA',
    'CLIENTE_SUCURSAL',
    'CLIENTE_TRABAJADOR',
  )
  cronograma(@Request() req: Request & { user: JwtPayload }) {
    return this.cronogramaCitaUseCase.execute(req.user);
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

  @Post('/start/:id')
  @Roles('ADMINISTRADOR', 'SOPORTE_INSITU')
  startCita(
    @Param('id') id_cita: number,
    @Request() req: Request & { user: JwtPayload },
  ) {
    return this.startCitaUseCase.execute(id_cita, req.user);
  }

  @Post('/complete/:id')
  @Roles('ADMINISTRADOR', 'SOPORTE_INSITU')
  completeCita(
    @Param('id') id_cita: number,
    @Request() req: Request & { user: JwtPayload },
    @Body() dto: CompleteCitaDto,
  ) {
    return this.completeCitaUseCase.execute(id_cita, req.user, dto);
  }

  @Post('/cancel/:id')
  @Roles('ADMINISTRADOR', 'SOPORTE_INSITU')
  cancelCita(
    @Param('id') id_cita: number,
    @Request() req: Request & { user: JwtPayload },
    @Body() dto: CancelCitaDto,
  ) {
    return this.cancelCitaUseCase.execute(id_cita, req.user, dto);
  }
}
