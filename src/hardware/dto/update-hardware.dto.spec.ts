import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

describe('UpdateHardwareDto', () => {
  const UpdateHardwareDto = require('./update-hardware.dto').UpdateHardwareDto;

  it('debería ser válido vacío (todos opcionales)', async () => {
    const dto = plainToClass(UpdateHardwareDto, {});
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería ser válido con datos correctos', async () => {
    const dto = plainToClass(UpdateHardwareDto, {
      tipo: 'RAM',
      marca: 'Kingston',
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
