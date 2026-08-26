import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';

import { CitasController } from '../citas.controller';
import { CreateCitaUseCase } from '../application/create-cita.use-case';
import { CreateCitaDto } from '../dto/create-cita-dto';

// Mocks secundarios requeridos por el constructor
import { CronogramaCitaUseCase } from '../application/cronograma-cita.use-case';
import { FindAllCitaUseCase } from '../application/find-all-cita.use-case';
import { FindOneCitaUseCase } from '../application/find-one-cita.use-case';
import { RelocateCitaUseCase } from '../application/relocate-cita.use-case';
import { UpdateCitaUseCase } from '../application/update-cita.use-case';
import { AddTicketsToCitaUseCase } from '../application/add-tickets-to-cita.use-case';
import { StartCitaUseCase } from '../application/start-cita.use-case';
import { CompleteCitaUseCase } from '../application/complete-cita.use-case';
import { CancelCitaUseCase } from '../application/cancel-cita.use-case';

describe('CitasController - POST /citas (Crear Cita)', () => {
  let controller: CitasController;
  let createCitaUseCase: CreateCitaUseCase;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CitasController],
      providers: [
        Reflector,
        {
          provide: CreateCitaUseCase,
          useValue: { execute: jest.fn() },
        },
        { provide: CronogramaCitaUseCase, useValue: {} },
        { provide: FindAllCitaUseCase, useValue: {} },
        { provide: FindOneCitaUseCase, useValue: {} },
        { provide: RelocateCitaUseCase, useValue: {} },
        { provide: UpdateCitaUseCase, useValue: {} },
        { provide: AddTicketsToCitaUseCase, useValue: {} },
        { provide: StartCitaUseCase, useValue: {} },
        { provide: CompleteCitaUseCase, useValue: {} },
        { provide: CancelCitaUseCase, useValue: {} },
      ],
    }).compile();

    controller = module.get<CitasController>(CitasController);
    createCitaUseCase = module.get<CreateCitaUseCase>(CreateCitaUseCase);
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe crear una cita exitosamente invocando al caso de uso con el DTO adecuado', async () => {
    const dto: CreateCitaDto = {
      ticket_ids: new Set([1, 2]),
      id_sucursal: 1,
      fecha_programada: new Date('2026-08-26T10:00:00.000Z'),
      id_soporte: 1,
    };

    const expectedResponse = { mensaje: 'Cita creada exitosamente' };

    jest
      .spyOn(createCitaUseCase, 'execute')
      .mockResolvedValue(expectedResponse as any);

    const result = await controller.create(dto);

    expect(createCitaUseCase.execute).toHaveBeenCalledWith(dto);
    expect(result).toEqual(expectedResponse);
  });

  it('debe verificar que el decorador @Roles incluya ADMINISTRADOR y SOPORTE_INSITU', () => {
    const roles = reflector.get<string[]>(
      'roles',
      CitasController.prototype.create,
    );

    expect(roles).toBeDefined();
    expect(roles).toEqual(
      expect.arrayContaining(['ADMINISTRADOR', 'SOPORTE_INSITU']),
    );
  });
});
