import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

describe('InstallSoftwareDto', () => {
  const InstallSoftwareDto = require('./install-software.dto').InstallSoftwareDto;

  it('debería ser válido con datos correctos', async () => {
    const dto = plainToClass(InstallSoftwareDto, {
      id_equipo: 1,
      licencia_asignada: 'XXXXX-XXXXX',
      observaciones: 'Instalado por soporte',
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería fallar si id_equipo no es número', async () => {
    const dto = plainToClass(InstallSoftwareDto, {
      id_equipo: 'abc',
      licencia_asignada: 'XXXXX',
    });
    const errors = await validate(dto);
    expect(errors.some(e => e.property === 'id_equipo')).toBe(true);
  });

  it('debería fallar si licencia_asignada está vacía', async () => {
    const dto = plainToClass(InstallSoftwareDto, {
      id_equipo: 1,
      licencia_asignada: '',
    });
    const errors = await validate(dto);
    expect(errors.some(e => e.property === 'licencia_asignada')).toBe(true);
  });
});
