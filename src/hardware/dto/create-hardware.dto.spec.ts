import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

describe('CreateHardwareDto', () => {
  const CreateHardwareDto = require('./create-hardware.dto').CreateHardwareDto;

  it('debería ser válido con datos correctos', async () => {
    const dto = plainToClass(CreateHardwareDto, {
      tipo_equipo: 'SSD',
      numero_serie: 'SN123',
      marca: 'Samsung',
      proveedor: 'Amazon',
      descripcion: 'SSD 1TB',
      fecha_compra: '2024-01-01',
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería fallar si tipo_equipo está vacío', async () => {
    const dto = plainToClass(CreateHardwareDto, {
      tipo_equipo: '',
      numero_serie: 'SN123',
      marca: 'Samsung',
      proveedor: 'Amazon',
      descripcion: 'SSD 1TB',
      fecha_compra: '2024-01-01',
    });
    const errors = await validate(dto);
    expect(errors.some(e => e.property === 'tipo_equipo')).toBe(true);
  });
});
