import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

describe('UpdateContractDto', () => {
  const UpdateContractDto = require('./update-contract.dto').UpdateContractDto;

  it('debería ser válido con datos correctos', async () => {
    const dto = plainToClass(UpdateContractDto, {
      id_plan: 1,
      nuevaFechaInicio: '2024-01-01',
      nuevaFechaFin: '2025-01-01',
      nuevoCosto: 100,
      nuevoLimite: 50,
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería fallar si id_plan no es entero', async () => {
    const dto = plainToClass(UpdateContractDto, {
      id_plan: 'abc',
      nuevaFechaInicio: '2024-01-01',
      nuevaFechaFin: '2025-01-01',
    });
    const errors = await validate(dto);
    expect(errors.some(e => e.property === 'id_plan')).toBe(true);
  });

  it('debería fallar si nuevaFechaInicio no es fecha válida', async () => {
    const dto = plainToClass(UpdateContractDto, {
      id_plan: 1,
      nuevaFechaInicio: 'fecha-invalida',
      nuevaFechaFin: '2025-01-01',
    });
    const errors = await validate(dto);
    expect(errors.some(e => e.property === 'nuevaFechaInicio')).toBe(true);
  });
});
