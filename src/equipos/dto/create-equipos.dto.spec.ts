import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

describe('CreateEquipoDTO', () => {
  const CreateEquipoDTO = require('./create-equipos.dto').CreateEquipoDTO;

  it('debería ser válido con datos correctos', async () => {
    const dto = plainToClass(CreateEquipoDTO, {
      tipo: 'Laptop',
      marca: 'Dell',
      numero_serie: 'SN123',
      id_cliente: 1,
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería fallar si tipo está vacío', async () => {
    const dto = plainToClass(CreateEquipoDTO, {
      tipo: '',
      marca: 'Dell',
      numero_serie: 'SN123',
      id_cliente: 1,
    });
    const errors = await validate(dto);
    expect(errors.some(e => e.property === 'tipo')).toBe(true);
  });

  it('debería fallar si id_cliente no es número', async () => {
    const dto = plainToClass(CreateEquipoDTO, {
      tipo: 'Laptop',
      marca: 'Dell',
      numero_serie: 'SN123',
      id_cliente: 'abc',
    });
    const errors = await validate(dto);
    expect(errors.some(e => e.property === 'id_cliente')).toBe(true);
  });
});
