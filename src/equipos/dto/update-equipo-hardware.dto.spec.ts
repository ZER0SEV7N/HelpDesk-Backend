import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

describe('UpdateEquipoHardwareDto', () => {
  const UpdateEquipoHardwareDto = require('./update-equipo-hardware.dto').UpdateEquipoHardwareDto;

  it('debería ser válido vacío (todos opcionales)', async () => {
    const dto = plainToClass(UpdateEquipoHardwareDto, {});
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería ser válido con datos correctos', async () => {
    const dto = plainToClass(UpdateEquipoHardwareDto, {
      descripcion: 'RAM 8GB',
      serie: 'SN123',
      proveedor: 'Kingston',
      fecha_instalacion: '2024-01-01',
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería fallar si fecha_instalacion no es válida', async () => {
    const dto = plainToClass(UpdateEquipoHardwareDto, {
      fecha_instalacion: 'invalida',
    });
    const errors = await validate(dto);
    expect(errors.some(e => e.property === 'fecha_instalacion')).toBe(true);
  });
});
