import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

describe('RegisterDTO', () => {
  const RegisterDTO = require('./register-auth.dto').RegisterDTO;

  it('debería ser válido con datos correctos', async () => {
    const dto = plainToClass(RegisterDTO, {
      nombre: 'Juan',
      apellido: 'Pérez',
      correo: 'juan@example.com',
      telefono: '123456789',
      password: 'password123',
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería fallar si nombre está vacío', async () => {
    const dto = plainToClass(RegisterDTO, {
      nombre: '',
      apellido: 'Pérez',
      correo: 'juan@example.com',
      telefono: '123456789',
      password: 'password123',
    });
    const errors = await validate(dto);
    expect(errors.some(e => e.property === 'nombre')).toBe(true);
  });

  it('debería fallar si correo no es válido', async () => {
    const dto = plainToClass(RegisterDTO, {
      nombre: 'Juan',
      apellido: 'Pérez',
      correo: 'invalido',
      telefono: '123456789',
      password: 'password123',
    });
    const errors = await validate(dto);
    expect(errors.some(e => e.property === 'correo')).toBe(true);
  });

  it('debería fallar si password es muy corto', async () => {
    const dto = plainToClass(RegisterDTO, {
      nombre: 'Juan',
      apellido: 'Pérez',
      correo: 'juan@example.com',
      telefono: '123456789',
      password: '123',
    });
    const errors = await validate(dto);
    expect(errors.some(e => e.property === 'password')).toBe(true);
  });
});
