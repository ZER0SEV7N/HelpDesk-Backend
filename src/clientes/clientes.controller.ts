//src/clientes/clientes.controller.ts
//Controlador para la gestion de clientes
//Importaciones necesarias:
import { Body, Controller, Get, Post } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';

//Definicion del controlador ClientesController
@Controller('clientes')
export class ClientesController {
    constructor(private readonly clientesService: ClientesService) {}

    //API: Localhost:3000/clientes
    @Post()
    create(@Body() createEmpresaDto: CreateEmpresaDto) {
        return this.clientesService.create(createEmpresaDto);
    }

    //API: Localhost:3000/clientes
    @Get()
    findAll() {
        return this.clientesService.findAll();
    }
}
