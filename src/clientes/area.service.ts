//helpdesk-app/src/clientes/area.service.ts
//Modulo para manejar las funcionalidades relacionadas con las areas de los clientes
//Importaciones necesarias:
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAreaDto } from './dto/create-area.dto'; 
import { Sucursales } from 'src/entities/Sucursales.entity';
import { Area } from 'src/entities/Area.entity';
import { Clientes } from 'src/entities/Clientes.entity';

//Definicion del servicio AreaService
@Injectable()
export class AreaService {
    constructor(
        @InjectRepository(Area)
        private areaRepo: Repository<Area>,
        @InjectRepository(Sucursales)
        private sucursalRepo: Repository<Sucursales>,
    ) {}

    //Crear una nueva area para una sucursal existente
    async create(dto: CreateAreaDto) {
        //Validar que el id_sucursal esté definido
        if (!dto.id_sucursal) {
            throw new BadRequestException('El ID de la sucursal es requerido');
        }
        //Validar que la sucursal exista
        const sucursal = await this.sucursalExists(dto.id_sucursal);
        
        //Si la validacion es exitosa, se crea la nueva area 
        const nuevaArea = this.areaRepo.create({
            ...dto,
            sucursal: sucursal,
        });
        return await this.areaRepo.save(nuevaArea);
    }

    //Listar todas las areas de la sucursal
    async findBySucursal(id_sucursal: number) {
        //Validar que la sucursal exista
        await this.sucursalExists(id_sucursal); 

        return await this.areaRepo.find({
            where: { id_sucursal: id_sucursal },
        });
    }

    //Encontrar un area por ID
    async findOne(id: number) {
        const area = await this.areaRepo.findOne({
            where: { id_area: id },
            relations: ['sucursal', 'sucursal.cliente'],
        });
        if (!area) throw new NotFoundException(`Area con ID ${id} no encontrada`);
        return area;
    }

    async update(id: number, dto: CreateAreaDto) {
        const area = await this.findOne(id);

        if (dto.id_sucursal && dto.id_sucursal !== area.id_sucursal) {
            throw new BadRequestException('Operación no permitida: No se puede transferir un área a otra sucursal.');
        }
        Object.assign(area, dto);
        return this.areaRepo.save(area);
    }

    //Desactivar un area manualmente (no se eliminará de la base de datos por integridad referencial, solo se marcará como inactivo)
    async deactivate(id: number) {
        //Validar que el area exista
        const area = await this.findOne(id);
        if(!area.is_active) throw new BadRequestException('El área ya se encuentra inactiva');

        area.is_active = false;
        return this.areaRepo.save(area);
    }

    //Funcion para validar que una sucursal exista, si existe retorna la sucursal, si no existe lanza una excepcion
    private async sucursalExists(id_sucursal: number): Promise<Sucursales> {
        const sucursal = await this.sucursalRepo.findOne({
            where: { id_sucursal },
        });
        if (!sucursal) throw new NotFoundException(`Sucursal con ID ${id_sucursal} no encontrada`);
        
        return sucursal;
    }

    async findAll() {
        return await this.areaRepo.find({
            relations: ['sucursal'],
        });
    }
}