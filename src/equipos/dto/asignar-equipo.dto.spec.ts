import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

describe('AsignarEquipoDto', () => {
  const AsignarEquipoDto = require('./asignar-equipo.dto').AsignarEquipoDto;

  it('debería ser válido con datos correctos', async () => {
    const dto = plainToClass(AsignarEquipoDto, {
      id_trabajador: 1,
      area: 'Contabilidad',
      id_sucursal: 1,
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería fallar si area está vacía', async () => {
    const dto = plainToClass(AsignarEquipoDto, {
      id_trabajador: 1,
      area: '',
    });
    const errors = await validate(dto);
    expect(errors.some(e => e.property === 'area')).toBe(true);
  });

  it('debería fallar si id_trabajador no es número', async () => {
    const dto = plainToClass(AsignarEquipoDto, {
      id_trabajador: 'abc',
      area: 'Contabilidad',
    });
    const errors = await validate(dto);
    expect(errors.some(e => e.property === 'id_trabajador')).toBe(true);
  });
});
