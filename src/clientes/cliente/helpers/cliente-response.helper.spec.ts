import { ClienteResponseHelper } from './cliente-response.helper';
import { Clientes } from '@/entities/Clientes.entity';
import { Planes } from '@/entities/Planes.entity';
import { Sucursales } from '@/entities/Sucursales.entity';
import { Equipos } from '@/entities/Equipos.entity';

describe('ClienteResponseHelper', () => {
  const helper = new ClienteResponseHelper();

  it('debería retornar null si cliente es null', () => {
    expect(helper.cleanResponse(null as any)).toBeNull();
  });

  it('debería limpiar cliente sin relaciones', () => {
    const cliente = {
      id_cliente: 1,
      nombre_principal: 'Empresa Test',
      created_at: new Date(),
      updated_at: new Date(),
      fecha_registro: new Date(),
    } as Clientes;

    const result = helper.cleanResponse(cliente);
    expect(result).not.toHaveProperty('created_at');
    expect(result).not.toHaveProperty('updated_at');
    expect(result).not.toHaveProperty('fecha_registro');
    expect(result.nombre_principal).toBe('Empresa Test');
  });

  it('debería limpiar plan dentro de cliente', () => {
    const cliente = {
      id_cliente: 1,
      nombre_principal: 'Empresa Test',
      plan: {
        id_plan: 1,
        tipo: 'Básico',
        precio: 100,
        limite_equipos: 10,
        created_at: new Date(),
        updated_at: new Date(),
        is_active: true,
      } as Planes,
    } as Clientes;

    const result = helper.cleanResponse(cliente);
    expect(result.plan).not.toHaveProperty('precio');
    expect(result.plan).not.toHaveProperty('limite_equipos');
    expect(result.plan).not.toHaveProperty('created_at');
    expect(result.plan).not.toHaveProperty('updated_at');
    expect(result.plan).not.toHaveProperty('is_active');
    expect(result.plan.tipo).toBe('Básico');
  });

  it('debería limpiar sucursales y equipos', () => {
    const cliente = {
      id_cliente: 1,
      nombre_principal: 'Empresa Test',
      sucursales: [
        {
          id_sucursal: 1,
          nombre_sucursal: 'Centro',
          created_at: new Date(),
          updated_at: new Date(),
        } as Sucursales,
      ],
      equipos: [
        {
          id_equipo: 1,
          tipo: 'Laptop',
          created_at: new Date(),
          updated_at: new Date(),
        } as Equipos,
      ],
    } as Clientes;

    const result = helper.cleanResponse(cliente);
    expect(result.sucursales[0]).not.toHaveProperty('created_at');
    expect(result.sucursales[0]).not.toHaveProperty('updated_at');
    expect(result.equipos[0]).not.toHaveProperty('created_at');
    expect(result.equipos[0]).not.toHaveProperty('updated_at');
  });
});
