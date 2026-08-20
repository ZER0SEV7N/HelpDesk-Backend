import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

describe('CreatePlanDto', () => {
  const CreatePlanDto = require('./create-plan.dto').CreatePlanDto;

  it('debería ser válido con datos correctos', async () => {
    const dto = plainToClass(CreatePlanDto, {
      numero_plan: 1,
      tipo: 'Básico',
      servicios: ['Soporte 24/7'],
      precio: 100,
      limite_equipos: 10,
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería fallar si tipo está vacío', async () => {
    const dto = plainToClass(CreatePlanDto, {
      numero_plan: 1,
      tipo: '',
      servicios: ['Soporte 24/7'],
      precio: 100,
      limite_equipos: 10,
    });
    const errors = await validate(dto);
    expect(errors.some(e => e.property === 'tipo')).toBe(true);
  });
});
