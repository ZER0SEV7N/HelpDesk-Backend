import { SucursalResponseHelper } from './sucursal-response.helper';
import { Sucursales } from '@/entities/Sucursales.entity';
import { Clientes } from '@/entities/Clientes.entity';
import { Usuario } from '@/entities/Usuario.entity';

describe('SucursalResponseHelper', () => {
  const helper = new SucursalResponseHelper();

  it('debería retornar null si sucursal es null', () => {
    expect(helper.cleanResponse(null as any)).toBeNull();
  });

  it('debería limpiar sucursal sin relaciones', () => {
    const sucursal = {
      id_sucursal: 1,
      nombre_sucursal: 'Centro',
      created_at: new Date(),
      updated_at: new Date(),
    } as Sucursales;

    const result = helper.cleanResponse(sucursal);
    expect(result).not.toHaveProperty('created_at');
    expect(result).not.toHaveProperty('updated_at');
    expect(result.nombre_sucursal).toBe('Centro');
  });

  it('debería limpiar cliente dentro de sucursal', () => {
    const sucursal = {
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
    } as Sucursales;

    const result = helper.cleanResponse(sucursal);
    expect(result.cliente).not.toHaveProperty('created_at');
    expect(result.cliente).not.toHaveProperty('updated_at');
    expect(result.cliente).not.toHaveProperty('fecha_registro');
  });

  it('debería remover contraseña de usuarios', () => {
    const sucursal = {
      id_sucursal: 1,
      nombre_sucursal: 'Centro',
      created_at: new Date(),
      updated_at: new Date(),
      usuarios: [
        {
          id_usuario: 1,
          nombre: 'Juan',
          password: 'secret',
          contraseña: 'secret',
          created_at: new Date(),
          updated_at: new Date(),
        } as Usuario,
      ],
    } as Sucursales;

    const result = helper.cleanResponse(sucursal);
    expect(result.usuarios[0]).not.toHaveProperty('password');
    expect(result.usuarios[0]).not.toHaveProperty('contraseña');
    expect(result.usuarios[0]).not.toHaveProperty('created_at');
    expect(result.usuarios[0].nombre).toBe('Juan');
  });
});
