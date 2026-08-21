import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

describe('CreateTicketDto', () => {
  const CreateTicketDto = require('./create-ticket.dto').CreateTicketDto;

  it('debería ser válido con datos correctos', async () => {
    const dto = plainToClass(CreateTicketDto, {
      asunto: 'No enciende',
      id_equipo: 1,
      es_software: false,
      detalle: 'El equipo no prende',
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería fallar si asunto está vacío', async () => {
    const dto = plainToClass(CreateTicketDto, {
      asunto: '',
      id_equipo: 1,
      es_software: false,
      detalle: 'El equipo no prende',
    });
    const errors = await validate(dto);
    expect(errors.some(e => e.property === 'asunto')).toBe(true);
  });

  it('debería fallar si id_equipo no es número', async () => {
    const dto = plainToClass(CreateTicketDto, {
      asunto: 'No enciende',
      id_equipo: 'abc',
      es_software: false,
      detalle: 'El equipo no prende',
    });
    const errors = await validate(dto);
    expect(errors.some(e => e.property === 'id_equipo')).toBe(true);
  });
});
