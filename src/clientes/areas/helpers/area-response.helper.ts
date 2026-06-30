import { Injectable } from '@nestjs/common';
import { Area } from '@/entities/Area.entity';


@Injectable()
export class AreaResponseHelper {
  cleanResponse(area: Area) {
    if (!area) return null;
    
    const { created_at, updated_at, ...areaLimpia } = area;

    if (area.sucursal) {
      const { created_at, updated_at, ...sucursalLimpia } = area.sucursal;
      areaLimpia.sucursal = sucursalLimpia as any;

      if (area.sucursal.cliente && areaLimpia.sucursal) {
        const { created_at, updated_at, fecha_registro, ...clienteLimpio } = area.sucursal.cliente;
        areaLimpia.sucursal.cliente = clienteLimpio as any;
      }
    }
    return areaLimpia;
  }
}