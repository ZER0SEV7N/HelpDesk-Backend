//helpdesk-app/src/clientes/area.service.ts
//Modulo para manejar las funcionalidades relacionadas con las areas de los clientes
//Importaciones necesarias:
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAreaDto } from './dto/create-area.dto'; 
import { Sucursales } from 'src/entities/Sucursales.entity';
import { Area } from 'src/entities/Area.entity';

//Definicion del servicio AreaService
@Injectable()
export class AreaService {
    constructor(
        @InjectRepository(Area)
        private areaRepo: Repository<Area>,
        @InjectRepository(Sucursales)
        private sucursalRepo: Repository<Sucursales>,
    ) {}

    private cleanResponse(area: Area) {
        const { created_at, updated_at, ...areaLimpia } = area;

        //Limpiamos la sucursal anidada si existe
        if (area.sucursal) {
            const { created_at, updated_at, ...sucursalLimpia } = area.sucursal;
            areaLimpia.sucursal = sucursalLimpia as any;

            //Limpiamos el cliente anidado dentro de la sucursal si existe
            if (area.sucursal.cliente && areaLimpia.sucursal) {
                const { created_at, updated_at, fecha_registro, ...clienteLimpio } = area.sucursal.cliente;
                areaLimpia.sucursal.cliente = clienteLimpio as any;
            }
        }
        return areaLimpia;
    }

    //Crear una nueva area para una sucursal existente
    async create(dto: CreateAreaDto) {
        //Validar que el id_sucursal esté definido
        if (!dto.id_sucursal) {
            throw new BadRequestException('El ID de la sucursal es requerido');
        }
        
        const sucursal = await this.sucursalExists(dto.id_sucursal);
        
        const nuevaArea = this.areaRepo.create({
            ...dto,
            sucursal: sucursal,
        });
        
        const saved = await this.areaRepo.save(nuevaArea);
        return this.cleanResponse(saved);
    }

    //Listar todas las areas de todas las sucursales
    async findAll() {
        const areas = await this.areaRepo.find({
            relations: ['sucursal'],
        });
        return areas.map(area => this.cleanResponse(area));
    }

    //Listar todas las areas de la sucursal
    async findBySucursal(id_sucursal: number) {
        //Validar que la sucursal exista
        await this.sucursalExists(id_sucursal); 

        const areas = await this.areaRepo.find({
            where: { id_sucursal: id_sucursal },
        });
        return areas.map(area => this.cleanResponse(area));
    }

    //Encontrar un area por ID
    async findOne(id: number) {
        const area = await this.areaRepo.findOne({
            where: { id_area: id },
            relations: ['sucursal', 'sucursal.cliente'],
        });
        if (!area) throw new NotFoundException(`Area con ID ${id} no encontrada`);
        
        return this.cleanResponse(area);
    }

    //Actualizar los datos de un area (excepto cambiarla de sucursal, 
    //para eso se recomienda crear un nuevo area en la nueva sucursal y desactivar el area anterior por integridad referencial)
    async update(id: number, dto: Partial<CreateAreaDto>) {
        const area = await this.areaRepo.findOne({ where: { id_area: id } });
        if (!area) throw new NotFoundException(`Area con ID ${id} no encontrada`);

        if (dto.id_sucursal && dto.id_sucursal !== area.id_sucursal) {
            throw new BadRequestException('Operación no permitida: No se puede transferir un área a otra sucursal.');
        }
        
        Object.assign(area, dto);
        const updated = await this.areaRepo.save(area);
        return this.cleanResponse(updated);
    }

    //Desactivar un area manualmente (no se eliminará de la base de datos por integridad referencial, solo se marcará como inactivo)
    async deactivate(id: number) {
        const area = await this.areaRepo.findOne({ where: { id_area: id } });
        if (!area) throw new NotFoundException(`Area con ID ${id} no encontrada`);
        if(!area.is_active) throw new BadRequestException('El área ya se encuentra inactiva');

        area.is_active = false;
        await this.areaRepo.save(area);
        return { message: `El área ${area.nombre_area} ha sido desactivada.` };
    }

    //Activar un area manualmente (no se eliminará de la base de datos por integridad referencial, solo se marcará como activo)
    async reactivate(id: number) {
        const area = await this.areaRepo.findOne({ where: { id_area: id } });
        if (!area) throw new NotFoundException(`Area con ID ${id} no encontrada`);
        if(area.is_active) throw new BadRequestException('El área ya se encuentra activa');
        area.is_active = true;
        await this.areaRepo.save(area);
        return { message: `El área ${area.nombre_area} ha sido reactivada.` };
    }


    //Funcion para validar que una sucursal exista, si existe retorna la sucursal, si no existe lanza una excepcion
    private async sucursalExists(id_sucursal: number): Promise<Sucursales> {
        const sucursal = await this.sucursalRepo.findOne({
            where: { id_sucursal },
        });
        if (!sucursal) throw new NotFoundException(`Sucursal con ID ${id_sucursal} no encontrada`);
        
        return sucursal;
    }
}