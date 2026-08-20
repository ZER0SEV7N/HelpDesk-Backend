import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

describe('GetUsersFilterDto', () => {
  const GetUsersFilterDto = require('./get-users-filter.dto').GetUsersFilterDto;

  it('debería ser válido con datos correctos', async () => {
    const dto = plainToClass(GetUsersFilterDto, {
      id_usuario: 1,
      rolNombre: 'ADMINISTRADOR',
      nombre: 'Juan',
      cliente: 'Empresa',
      sucursal: 'Centro',
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería ser válido vacío', async () => {
    const dto = plainToClass(GetUsersFilterDto, {});
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería fallar si id_usuario no es entero', async () => {
    const dto = plainToClass(GetUsersFilterDto, {
      id_usuario: 'abc',
    });
    const errors = await validate(dto);
    expect(errors.some(e => e.property === 'id_usuario')).toBe(true);
  });
});
