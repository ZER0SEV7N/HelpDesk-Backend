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

@Controller('citas')
export class CitasController {
  constructor(private readonly createCitaUseCase: CreateCitaUseCase) {}

  @Get()
  findAll() {
    return 'Citas list';
  }

  @Post('/')
  create(@Body() createCitaDto: any) {
    return this.createCitaUseCase.execute(createCitaDto);
  }
}
