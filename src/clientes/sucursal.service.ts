//helpdesk-app/src/clientes/sucursal.service.ts
//Modulo de servicio para manejar las funcionalidades relacionadas con las sucursales de los clientes
//Importaciones necesarias:
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sucursales } from 'src/entities/Sucursales.entity';
import { CreateSucursalDto } from './dto/create-sucursal.dto';
import { Clientes } from 'src/entities/Clientes.entity';

@Injectable()
export class SucursalService {
    constructor(
        @InjectRepository(Sucursales)
        private sucursalRepo: Repository<Sucursales>,
        @InjectRepository(Clientes)
        private clientesRepo: Repository<Clientes>,
    ) {}

    //Crear una nueva sucursal para un cliente existente
    async create(dto: CreateSucursalDto) {
        //Validar que el cliente exista
        const cliente = await this.clientExists(dto.id_cliente);
        
        //Si la validacion es exitosa, se crea la nueva sucursal 
        const nuevaSucursal = this.sucursalRepo.create({
            ...dto,
            cliente: cliente,
        });

        return await this.sucursalRepo.save(nuevaSucursal);
    }

    //Listar todas las sucursales de todas las empresas
    async findAll() {
        return await this.sucursalRepo.find({
            relations: ['cliente', 'areas'],
        });
    }

    //Encontrar una sucursal por ID
    async findOne(id: number) {
        const sucursal = await this.sucursalRepo.findOne({
            where: { id_sucursal: id },
            relations: ['cliente', 'areas', 'equipos', 'usuarios'],
        });
        if (!sucursal) throw new NotFoundException(`Sucursal con ID ${id} no encontrada`);
        return sucursal;
    }

    //Listar las sucursales de un cliente especifico
    async findByCliente(id_cliente: number) {
        //Validar que el cliente exista
        const cliente = await this.clientExists(id_cliente);
        return await this.sucursalRepo.find({
            where: {id_cliente: id_cliente},
            relations: ['areas'],
        });
    }

    //Actualizar los datos de una sucursal
    async update(id: number, dto: Partial<CreateSucursalDto>) {
        const sucursal = await this.sucursalExists(id);
        //Validar que no se intente cambiar el cliente de la sucursal (no se permite transferir sucursales entre clientes)
        if (dto.id_cliente && dto.id_cliente !== sucursal.id_cliente) {
            throw new BadRequestException('Operación no permitida: No se puede transferir una sucursal a otra empresa.');
        }
        
        Object.assign(sucursal, dto);
        return this.sucursalRepo.save(sucursal);
    }

    //Desactivar una sucursal (no se eliminará de la base de datos por integridad referencial, solo se marcará como inactiva)
    async deactivate(id: number) {
        const sucursal = await this.sucursalExists(id);
        if(!sucursal.is_active) throw new BadRequestException('La sucursal ya se encuentra inactiva');
        sucursal.is_active = false;
        return this.sucursalRepo.save(sucursal);
    }

    private async clientExists(id_cliente: number) {
        const cliente = await this.clientesRepo.findOne({ where: { id_cliente } });
        if (!cliente) throw new NotFoundException(`Cliente con ID ${id_cliente} no encontrado`);
        return cliente;
    }

    private async sucursalExists(id_sucursal: number) {
        const sucursal = await this.sucursalRepo.findOne({ where: { id_sucursal } });
        if (!sucursal) throw new NotFoundException(`Sucursal con ID ${id_sucursal} no encontrada`);
        return sucursal;
    }
}