import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

describe('UpdateSoftwareDto', () => {
  const UpdateSoftwareDto = require('./update-software.dto').UpdateSoftwareDto;

  it('debería ser válido vacío (todos opcionales)', async () => {
    const dto = plainToClass(UpdateSoftwareDto, {});
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería ser válido con datos correctos', async () => {
    const dto = plainToClass(UpdateSoftwareDto, {
      nombre_software: 'Windows 11',
      version: '23H2',
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
