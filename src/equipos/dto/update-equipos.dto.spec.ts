import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

describe('UpdateEquipoDto', () => {
  const UpdateEquipoDto = require('./update-equipos.dto').UpdateEquipoDto;

  it('debería ser válido vacío (todos opcionales)', async () => {
    const dto = plainToClass(UpdateEquipoDto, {});
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería ser válido con datos parciales', async () => {
    const dto = plainToClass(UpdateEquipoDto, {
      tipo: 'Laptop',
      marca: 'Dell',
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería fallar si marca está vacía', async () => {
    const dto = plainToClass(UpdateEquipoDto, {
      marca: '',
    });
    const errors = await validate(dto);
    expect(errors.some(e => e.property === 'marca')).toBe(true);
  });
});
