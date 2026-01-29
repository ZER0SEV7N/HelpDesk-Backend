//src/clientes/clientes.service.ts
//Servicio para la gestion de clientes
//Importaciones necesarias:
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empresa } from '../entities/Empresa.entity';
import { CreateEmpresaDto } from './dto/create-empresa.dto';

//Definicion del servicio ClientesService
@Injectable()
export class ClientesService {
    constructor(
        @InjectRepository(Empresa)
        private empresaRepo: Repository<Empresa>,
    ) {}

    //Crear una nueva empresa
    async create(CreateEmpresaDto: CreateEmpresaDto) {
        const nuevaEmpresa = this.empresaRepo.create(CreateEmpresaDto);
        return this.empresaRepo.save(nuevaEmpresa);
    }

    //Listar todas las empresas
    async findAll() {
        return this.empresaRepo.find();
    }

    //Eliminar una Empresa
    async Delete() {

    }
}
