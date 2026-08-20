import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

describe('UpdateProfileDTO', () => {
  const UpdateProfileDTO = require('./update-profile.dto').UpdateProfileDTO;

  it('debería ser válido con datos correctos', async () => {
    const dto = plainToClass(UpdateProfileDTO, {
      currentPassword: 'oldpass',
      nombre: 'Juan',
      apellido: 'Pérez',
      telefono: '123456789',
      newPassword: 'newpass123',
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería fallar si currentPassword está vacío', async () => {
    const dto = plainToClass(UpdateProfileDTO, {
      currentPassword: '',
      nombre: 'Juan',
    });
    const errors = await validate(dto);
    expect(errors.some(e => e.property === 'currentPassword')).toBe(true);
  });

  it('debería fallar si newPassword es muy corto', async () => {
    const dto = plainToClass(UpdateProfileDTO, {
      currentPassword: 'oldpass',
      newPassword: '123',
    });
    const errors = await validate(dto);
    expect(errors.some(e => e.property === 'newPassword')).toBe(true);
  });
});
