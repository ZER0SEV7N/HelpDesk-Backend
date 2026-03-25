//src/clientes/clientes.service.ts
//Servicio para la gestion de clientes
//Importaciones necesarias:
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Clientes } from 'src/entities/Clientes.entity';
import { CreateClienteDto } from './dto/create-cliente.dto';

//Definicion del servicio ClientesService
@Injectable()
export class ClientesService {
    constructor(
        @InjectRepository(Clientes)
        private clientesRepo: Repository<Clientes>,
    ) {}

    //Crear una nueva empresa
    async create(dto: CreateClienteDto) {
        const exists = await this.clientesRepo.findOne({
            where: {numero_documento: dto.numero_documento}
        });

        if(exists) throw new ConflictException(`Ya existe un cliente con ese documento ${dto.numero_documento}`);

        const nuevoCliente = this.clientesRepo.create(dto)
        return this.clientesRepo.save(nuevoCliente);
    }

    //Listar todas las empresas
    async findAll() {
        return await this.clientesRepo.find({
        relations: ['sucursales', 'plan'],
        });
    }

    //Encontrar un cliente
    async findOne(id: number) {
        const cliente = await this.clientesRepo.findOne({
            where: {id_cliente: id},
            relations: ['sucursales', 'equipos', 'plan'],
        });
    
        if(!cliente) throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
        return cliente;
    }

    //Actualizar los datos de un cliente
    async update(id: number, dto: CreateClienteDto){
        const cliente = await this.clientesRepo.findOne({ where: {id_cliente: id}});
        if(!cliente) throw new NotFoundException(`Cliente con el ID ${id} no ha sido encontrado`);

        //Verificar que el documento no esté duplicado
        if(dto.numero_documento && dto.numero_documento !== cliente.numero_documento){
            const exists = await this.clientesRepo.findOne({
                where: {numero_documento: dto.numero_documento}
            });
            if(exists) throw new ConflictException(`Ya existe un cliente con ese documento ${dto.numero_documento}`);
        }
        Object.assign(cliente, dto);
        return this.clientesRepo.save(cliente);
    }

    //

    //Actualizar el contrato de un cliente
    async updatePlan(id: number, id_plan: number ){
        //Verificar que el plan actual
    }
}
