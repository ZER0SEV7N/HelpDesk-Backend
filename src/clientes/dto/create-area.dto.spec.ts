import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

describe('CreateAreaDTO', () => {
  const CreateAreaDTO = require('./create-area.dto').CreateAreaDTO;

  it('debería ser válido con datos correctos', async () => {
    const dto = plainToClass(CreateAreaDTO, {
      nombre_area: 'Contabilidad',
      contacto: 'María García',
      telefono: '123456789',
      correo: 'contabilidad@example.com',
      id_sucursal: 1,
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería fallar si correo no es válido', async () => {
    const dto = plainToClass(CreateAreaDTO, {
      nombre_area: 'Contabilidad',
      contacto: 'María García',
      telefono: '123456789',
      correo: 'invalido',
      id_sucursal: 1,
    });
    const errors = await validate(dto);
    expect(errors.some(e => e.property === 'correo')).toBe(true);
  });

  it('debería fallar si id_sucursal es menor a 1', async () => {
    const dto = plainToClass(CreateAreaDTO, {
      nombre_area: 'Contabilidad',
      contacto: 'María García',
      telefono: '123456789',
      correo: 'contabilidad@example.com',
      id_sucursal: 0,
    });
    const errors = await validate(dto);
    expect(errors.some(e => e.property === 'id_sucursal')).toBe(true);
  });
});
