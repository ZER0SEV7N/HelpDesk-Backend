import { AreaResponseHelper } from './area-response.helper';
import { Area } from '@/entities/Area.entity';
import { Sucursales } from '@/entities/Sucursales.entity';
import { Clientes } from '@/entities/Clientes.entity';

describe('AreaResponseHelper', () => {
  const helper = new AreaResponseHelper();

  it('debería retornar null si area es null', () => {
    expect(helper.cleanResponse(null as any)).toBeNull();
  });

  it('debería limpiar area sin relaciones', () => {
    const area = {
      id_area: 1,
      nombre_area: 'Contabilidad',
      created_at: new Date(),
      updated_at: new Date(),
    } as Area;

    const result = helper.cleanResponse(area);
    expect(result).not.toHaveProperty('created_at');
    expect(result).not.toHaveProperty('updated_at');
    expect(result.nombre_area).toBe('Contabilidad');
  });

  it('debería limpiar sucursal y cliente dentro de area', () => {
    const area = {
      id_area: 1,
      nombre_area: 'Contabilidad',
      created_at: new Date(),
      updated_at: new Date(),
      sucursal: {
        id_sucursal: 1,
        nombre_sucursal: 'Centro',
        created_at: new Date(),
        updated_at: new Date(),
        cliente: {
          id_cliente: 1,
          nombre_principal: 'Empresa Test',
          created_at: new Date(),
          updated_at: new Date(),
          fecha_registro: new Date(),
        } as Clientes,
      } as Sucursales,
    } as Area;

    const result = helper.cleanResponse(area);
    expect(result.sucursal).not.toHaveProperty('created_at');
    expect(result.sucursal).not.toHaveProperty('updated_at');
    expect(result.sucursal.cliente).not.toHaveProperty('created_at');
    expect(result.sucursal.cliente).not.toHaveProperty('updated_at');
    expect(result.sucursal.cliente).not.toHaveProperty('fecha_registro');
  });
});
