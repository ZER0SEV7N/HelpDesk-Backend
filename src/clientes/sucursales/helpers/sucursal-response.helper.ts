import { Injectable } from '@nestjs/common';
import { Sucursales } from '@/entities/Sucursales.entity';


@Injectable()
export class SucursalResponseHelper {
  cleanResponse(sucursal: Sucursales) {
    if (!sucursal) return null;

    const { created_at, updated_at, ...sucursalLimpia } = sucursal;

    if (sucursal.cliente) {
      const { created_at, updated_at, fecha_registro, ...clienteLimpio } = sucursal.cliente;
      sucursalLimpia.cliente = clienteLimpio as any;
    }

    if (sucursal.areas) {
      sucursalLimpia.areas = sucursal.areas.map(area => {
        const { created_at, updated_at, ...areaLimpia } = area;
        return areaLimpia;
      }) as any;
    }

    if (sucursal.equipos) {
      sucursalLimpia.equipos = sucursal.equipos.map(equipo => {
        const { created_at, updated_at, ...equipoLimpio } = equipo;
        return equipoLimpio;
      }) as any;
    }

    // Remover información sensible de los usuarios
    if (sucursal.usuarios) {
      sucursalLimpia.usuarios = sucursal.usuarios.map(usuario => {
        const { contraseña, password, created_at, updated_at, ...usuarioLimpio } = usuario as any;
        return usuarioLimpio;
      }) as any;
    }

    return sucursalLimpia;
  }
}