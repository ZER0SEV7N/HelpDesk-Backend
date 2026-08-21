import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

describe('CreateSoftwareDto', () => {
  const CreateSoftwareDto = require('./create-software.dto').CreateSoftwareDto;

  it('debería ser válido con datos correctos', async () => {
    const dto = plainToClass(CreateSoftwareDto, {
      nombre_software: 'Windows 11',
      licencia: 'XXXXX-XXXXX',
      correo: 'test@example.com',
      contraseña: 'pass123',
      fecha_instalacion: '2024-01-01',
      fecha_caducidad: '2025-01-01',
      proveedor: 'Microsoft',
      version: '23H2',
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería fallar si nombre_software está vacío', async () => {
    const dto = plainToClass(CreateSoftwareDto, {
      nombre_software: '',
      licencia: 'XXXXX',
      correo: 'test@example.com',
      contraseña: 'pass',
      fecha_instalacion: '2024-01-01',
      fecha_caducidad: '2025-01-01',
      proveedor: 'Microsoft',
    });
    const errors = await validate(dto);
    expect(errors.some(e => e.property === 'nombre_software')).toBe(true);
  });
});
