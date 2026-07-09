import { Area } from "@/entities/Area.entity";
import { Sucursales } from "@/entities/Sucursales.entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AreaResponseHelper } from "../helpers/area-response.helper";

@Injectable()
export class FindAllAreaUseCase {
  constructor(
    @InjectRepository(Area) private readonly areaRepo: Repository<Area>,
    @InjectRepository(Sucursales) private readonly sucursalRepo: Repository<Sucursales>,
    private readonly responseHelper: AreaResponseHelper,
  ) {}

    async execute() {
        // Obtenemos todas las áreas con sus sucursales relacionadas
        const areas = await this.areaRepo.find({relations: ['sucursal'],});
        // Limpiamos la respuesta para eliminar campos innecesarios y retornamos el resultado
        return areas.map((area) => this.responseHelper.cleanResponse(area));
    }
}