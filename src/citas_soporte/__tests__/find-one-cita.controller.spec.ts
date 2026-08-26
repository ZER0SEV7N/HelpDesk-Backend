import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';

import { CitasController } from '../citas.controller';
import { FindOneCitaUseCase } from '../application/find-one-cita.use-case';

import { CreateCitaUseCase } from '../application/create-cita.use-case';
import { CronogramaCitaUseCase } from '../application/cronograma-cita.use-case';
import { FindAllCitaUseCase } from '../application/find-all-cita.use-case';
import { RelocateCitaUseCase } from '../application/relocate-cita.use-case';
import { UpdateCitaUseCase } from '../application/update-cita.use-case';
import { AddTicketsToCitaUseCase } from '../application/add-tickets-to-cita.use-case';
import { StartCitaUseCase } from '../application/start-cita.use-case';
import { CompleteCitaUseCase } from '../application/complete-cita.use-case';
import { CancelCitaUseCase } from '../application/cancel-cita.use-case';

describe('CitasController - GET /citas/:id (Obtener una Cita por ID)', () => {
  let controller: CitasController;
  let findOneCitaUseCase: FindOneCitaUseCase;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CitasController],
      providers: [
        Reflector,
        {
          provide: FindOneCitaUseCase,
          useValue: { execute: jest.fn() },
        },
        { provide: CreateCitaUseCase, useValue: {} },
        { provide: CronogramaCitaUseCase, useValue: {} },
        { provide: FindAllCitaUseCase, useValue: {} },
        { provide: RelocateCitaUseCase, useValue: {} },
        { provide: UpdateCitaUseCase, useValue: {} },
        { provide: AddTicketsToCitaUseCase, useValue: {} },
        { provide: StartCitaUseCase, useValue: {} },
        { provide: CompleteCitaUseCase, useValue: {} },
        { provide: CancelCitaUseCase, useValue: {} },
      ],
    }).compile();

    controller = module.get<CitasController>(CitasController);
    findOneCitaUseCase = module.get<FindOneCitaUseCase>(FindOneCitaUseCase);
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe retornar los detalles de una cita específica buscando por su ID', async () => {
    const citaId = 1;
    const mockCitaDetail = {
      id_cita: 1,
      estado: 'Pendiente',
      fecha_programada: '2026-08-25T00:00:00.000Z',
      sucursal: { id_sucursal: 1, nombre_sucursal: 'Sucursal Central' },
    };

    jest
      .spyOn(findOneCitaUseCase, 'execute')
      .mockResolvedValue(mockCitaDetail as any);

    const result = await controller.findOne(citaId);

    expect(findOneCitaUseCase.execute).toHaveBeenCalledWith(citaId);
    expect(result).toEqual(mockCitaDetail);
  });

  it('debe verificar que el decorador @Roles incluya los roles de clientes y soporte in situ', () => {
    const roles = reflector.get<string[]>(
      'roles',
      CitasController.prototype.findOne,
    );

    expect(roles).toBeDefined();
    expect(roles).toEqual(
      expect.arrayContaining([
        'SOPORTE_INSITU',
        'CLIENTE_EMPRESA',
        'CLIENTE_SUCURSAL',
        'CLIENTE_TRABAJADOR',
      ]),
    );
  });

  it('no debe permitir al rol ADMINISTRADOR acceder directamente por este endpoint', () => {
    const roles = reflector.get<string[]>(
      'roles',
      CitasController.prototype.findOne,
    );
    expect(roles).not.toContain('ADMINISTRADOR');
  });
});
