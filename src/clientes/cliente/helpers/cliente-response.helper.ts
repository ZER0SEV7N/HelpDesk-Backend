import { Injectable } from '@nestjs/common';
import { Clientes } from '@/entities/Clientes.entity';

@Injectable()
export class ClienteResponseHelper {
  cleanResponse(cliente: Clientes) {
    if (!cliente) return null;

    const { created_at, updated_at, fecha_registro, ...clienteLimpio } = cliente;

    if (cliente.plan) {
      const { precio, limite_equipos, created_at: p_cat, updated_at: p_uat, is_active, ...planLimpio } = cliente.plan as any;
      clienteLimpio.plan = planLimpio;
    }

    if (cliente.sucursales) {
      clienteLimpio.sucursales = cliente.sucursales.map(sucursal => {
        const { created_at, updated_at, ...sucursalLimpia } = sucursal;
        return sucursalLimpia;
      }) as any;
    }

    if (cliente.equipos) {
      clienteLimpio.equipos = cliente.equipos.map(equipo => {
        const { created_at, updated_at, ...equipoLimpio } = equipo;
        return equipoLimpio;
      }) as any;
    }

    return clienteLimpio;
  }
}