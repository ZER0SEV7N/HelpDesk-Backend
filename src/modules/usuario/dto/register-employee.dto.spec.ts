import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

describe('RegisterEmployeeDto', () => {
  const RegisterEmployeeDto = require('./register-employee.dto').RegisterEmployeeDto;

  it('debería ser válido con datos correctos', async () => {
    const dto = plainToClass(RegisterEmployeeDto, {
      nombre: 'Juan',
      apellido: 'Pérez',
      correo: 'juan@example.com',
      telefono: '123456789',
      password: 'password123',
      rolNombre: 'CLIENTE_TRABAJADOR',
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería fallar si rolNombre está vacío', async () => {
    const dto = plainToClass(RegisterEmployeeDto, {
      nombre: 'Juan',
      apellido: 'Pérez',
      correo: 'juan@example.com',
      telefono: '123456789',
      password: 'password123',
      rolNombre: '',
    });
    const errors = await validate(dto);
    expect(errors.some(e => e.property === 'rolNombre')).toBe(true);
  });

  it('debería fallar si password es muy corto', async () => {
    const dto = plainToClass(RegisterEmployeeDto, {
      nombre: 'Juan',
      apellido: 'Pérez',
      correo: 'juan@example.com',
      telefono: '123456789',
      password: '123',
      rolNombre: 'CLIENTE_TRABAJADOR',
    });
    const errors = await validate(dto);
    expect(errors.some(e => e.property === 'password')).toBe(true);
  });
});
