import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { TipoCliente } from '@/entities/Clientes.entity';

describe('CreateSucursalDto', () => {
  const CreateSucursalDto = require('./create-sucursal.dto').CreateSucursalDto;

  it('debería ser válido con datos correctos', async () => {
    const dto = plainToClass(CreateSucursalDto, {
      nombre_sucursal: 'Sucursal Centro',
      encargado: 'Juan Pérez',
      telefono: '123456789',
      correo: 'sucursal@example.com',
      direccion: 'Calle 1',
      id_cliente: 1,
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería fallar si nombre_sucursal está vacío', async () => {
    const dto = plainToClass(CreateSucursalDto, {
      nombre_sucursal: '',
      encargado: 'Juan Pérez',
      telefono: '123456789',
      correo: 'sucursal@example.com',
      direccion: 'Calle 1',
      id_cliente: 1,
    });
    const errors = await validate(dto);
    expect(errors.some(e => e.property === 'nombre_sucursal')).toBe(true);
  });

  it('debería fallar si id_cliente no es un entero', async () => {
    const dto = plainToClass(CreateSucursalDto, {
      nombre_sucursal: 'Sucursal Centro',
      encargado: 'Juan Pérez',
      telefono: '123456789',
      correo: 'sucursal@example.com',
      direccion: 'Calle 1',
      id_cliente: 'abc',
    });
    const errors = await validate(dto);
    expect(errors.some(e => e.property === 'id_cliente')).toBe(true);
  });
});
