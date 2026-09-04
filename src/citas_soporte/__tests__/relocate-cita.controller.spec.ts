import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { NotFoundException, BadRequestException } from '@nestjs/common';

// Controlador, DTO y Caso de Uso principal bajo prueba
import { CitasController } from '../citas.controller';
import { RelocateCitaUseCase } from '../application/relocate-cita.use-case';
import { RelocateCitaDto } from '../dto/relocate-cita.dto';

// Mocks de los demás casos de uso requeridos por CitasController
import { CreateCitaUseCase } from '../application/create-cita.use-case';
import { CronogramaCitaUseCase } from '../application/cronograma-cita.use-case';
import { FindAllCitaUseCase } from '../application/find-all-cita.use-case';
import { FindOneCitaUseCase } from '../application/find-one-cita.use-case';
import { UpdateCitaUseCase } from '../application/update-cita.use-case';
import { AddTicketsToCitaUseCase } from '../application/add-tickets-to-cita.use-case';
import { StartCitaUseCase } from '../application/start-cita.use-case';
import { CompleteCitaUseCase } from '../application/complete-cita.use-case';
import { CancelCitaUseCase } from '../application/cancel-cita.use-case';

describe('CitasController - POST /citas/relocate/:id (Reprogramar Cita)', () => {
  let controller: CitasController;
  let relocateCitaUseCase: RelocateCitaUseCase;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CitasController],
      providers: [
        Reflector,
        {
          provide: RelocateCitaUseCase,
          useValue: { execute: jest.fn() },
        },
        { provide: CreateCitaUseCase, useValue: {} },
        { provide: CronogramaCitaUseCase, useValue: {} },
        { provide: FindAllCitaUseCase, useValue: {} },
        { provide: FindOneCitaUseCase, useValue: {} },
        { provide: UpdateCitaUseCase, useValue: {} },
        { provide: AddTicketsToCitaUseCase, useValue: {} },
        { provide: StartCitaUseCase, useValue: {} },
        { provide: CompleteCitaUseCase, useValue: {} },
        { provide: CancelCitaUseCase, useValue: {} },
      ],
    }).compile();

    controller = module.get<CitasController>(CitasController);
    relocateCitaUseCase = module.get<RelocateCitaUseCase>(RelocateCitaUseCase);
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================================
  // CASO DE ÉXITO (HAPPY PATH)
  // =========================================================================
  it('debe reprogramar la cita enviando el DTO y la cita origen al caso de uso', async () => {
    const citaIdActual = 1;
    const dto: RelocateCitaDto = {
      nueva_fecha_programada: '2026-08-27T10:00:00.000Z',
      motivo_reprogramacion: 'Cliente solicitó cambio por cruce de horarios.',
    };

    const mockResponse = {
      mensaje:
        'Cita reprogramada exitosamente. Se generó un nuevo agendamiento.',
      cita_historica_id: 1,
      nueva_cita: {
        id_cita: 2,
        fecha_programada: new Date(dto.nueva_fecha_programada),
        estado: 'Pendiente',
      },
    };

    jest
      .spyOn(relocateCitaUseCase, 'execute')
      .mockResolvedValue(mockResponse as any);

    const result = await controller.relocateCita(citaIdActual, dto);

    expect(relocateCitaUseCase.execute).toHaveBeenCalledWith(dto, citaIdActual);
    expect(result).toEqual(mockResponse);
  });

  // =========================================================================
  // REGLAS DE NEGOCIO Y EXCEPCIONES PROPAGADAS
  // =========================================================================
  it('debe propagar NotFoundException si la cita original a reprogramar no existe', async () => {
    const citaIdActual = 999;
    const dto: RelocateCitaDto = {
      nueva_fecha_programada: '2026-08-27T10:00:00.000Z',
      motivo_reprogramacion: 'Reprogramación de cita inexistente',
    };

    jest
      .spyOn(relocateCitaUseCase, 'execute')
      .mockRejectedValue(
        new NotFoundException('La cita con ID #999 no fue encontrada.'),
      );

    await expect(controller.relocateCita(citaIdActual, dto)).rejects.toThrow(
      NotFoundException,
    );

    expect(relocateCitaUseCase.execute).toHaveBeenCalledWith(dto, citaIdActual);
  });

  it('debe propagar BadRequestException si la cita está en estado inaccesible (Completada, Cancelada, Reprogramada)', async () => {
    const citaIdActual = 1;
    const dto: RelocateCitaDto = {
      nueva_fecha_programada: '2026-08-27T10:00:00.000Z',
      motivo_reprogramacion: 'Intento de reprogramar cita finalizada',
    };

    jest
      .spyOn(relocateCitaUseCase, 'execute')
      .mockRejectedValue(
        new BadRequestException(
          'No se puede reprogramar una cita en estado Completada.',
        ),
      );

    await expect(controller.relocateCita(citaIdActual, dto)).rejects.toThrow(
      BadRequestException,
    );

    expect(relocateCitaUseCase.execute).toHaveBeenCalledWith(dto, citaIdActual);
  });

  // =========================================================================
  // VERIFICACIÓN DE SEGURIDAD (@Roles DECORATOR METADATA)
  // =========================================================================
  it('debe verificar mediante Reflector que los roles autorizados sean ADMINISTRADOR y SOPORTE_INSITU', () => {
    const roles = reflector.get<string[]>(
      'roles',
      CitasController.prototype.relocateCita,
    );

    expect(roles).toBeDefined();
    expect(roles).toEqual(
      expect.arrayContaining(['ADMINISTRADOR', 'SOPORTE_INSITU']),
    );
  });

  it('no debe permitir que roles de clientes o soporte técnico remoto accedan al endpoint', () => {
    const roles = reflector.get<string[]>(
      'roles',
      CitasController.prototype.relocateCita,
    );

    expect(roles).not.toContain('CLIENTE_EMPRESA');
    expect(roles).not.toContain('CLIENTE_SUCURSAL');
    expect(roles).not.toContain('CLIENTE_TRABAJADOR');
    expect(roles).not.toContain('SOPORTE_TECNICO');
  });
});
