import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

describe('LoginDTO', () => {
  const LoginDTO = require('./login-auth.dto').LoginDTO;

  it('debería ser válido con datos correctos', async () => {
    const dto = plainToClass(LoginDTO, {
      correo: 'juan@example.com',
      password: 'password123',
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería fallar si password es muy corto', async () => {
    const dto = plainToClass(LoginDTO, {
      correo: 'juan@example.com',
      password: '123',
    });
    const errors = await validate(dto);
    expect(errors.some(e => e.property === 'password')).toBe(true);
  });

  it('debería fallar si correo no es válido', async () => {
    const dto = plainToClass(LoginDTO, {
      correo: 'invalido',
      password: 'password123',
    });
    const errors = await validate(dto);
    expect(errors.some(e => e.property === 'correo')).toBe(true);
  });
});
