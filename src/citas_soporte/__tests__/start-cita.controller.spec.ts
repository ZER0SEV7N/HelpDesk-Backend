import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';

// 1. Controlador, JwtPayload y Caso de Uso bajo prueba
import { CitasController } from '../citas.controller';
import { StartCitaUseCase } from '../application/start-cita.use-case';
import { JwtPayload } from '@/common/guards/jwt-auth.guard';

// 2. Mocks de los demás casos de uso requeridos por el controlador
import { CreateCitaUseCase } from '../application/create-cita.use-case';
import { CronogramaCitaUseCase } from '../application/cronograma-cita.use-case';
import { FindAllCitaUseCase } from '../application/find-all-cita.use-case';
import { FindOneCitaUseCase } from '../application/find-one-cita.use-case';
import { RelocateCitaUseCase } from '../application/relocate-cita.use-case';
import { UpdateCitaUseCase } from '../application/update-cita.use-case';
import { AddTicketsToCitaUseCase } from '../application/add-tickets-to-cita.use-case';
import { CompleteCitaUseCase } from '../application/complete-cita.use-case';
import { CancelCitaUseCase } from '../application/cancel-cita.use-case';

describe('CitasController - POST /citas/start/:id (Iniciar Cita)', () => {
  let controller: CitasController;
  let startCitaUseCase: StartCitaUseCase;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CitasController],
      providers: [
        Reflector,
        {
          provide: StartCitaUseCase,
          useValue: { execute: jest.fn() },
        },
        { provide: CreateCitaUseCase, useValue: {} },
        { provide: CronogramaCitaUseCase, useValue: {} },
        { provide: FindAllCitaUseCase, useValue: {} },
        { provide: FindOneCitaUseCase, useValue: {} },
        { provide: RelocateCitaUseCase, useValue: {} },
        { provide: UpdateCitaUseCase, useValue: {} },
        { provide: AddTicketsToCitaUseCase, useValue: {} },
        { provide: CompleteCitaUseCase, useValue: {} },
        { provide: CancelCitaUseCase, useValue: {} },
      ],
    }).compile();

    controller = module.get<CitasController>(CitasController);
    startCitaUseCase = module.get<StartCitaUseCase>(StartCitaUseCase);
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================================
  // CASO DE ÉXITO (HAPPY PATH)
  // =========================================================================
  it('debe pasar el estado de la cita a "En Camino" cuando los parámetros del usuario en la Request son válidos', async () => {
    const citaId = 1;
    const mockUser: JwtPayload = {
      userId: 3,
      clienteId: 1,
      role: 'SOPORTE_INSITU',
      sub: 3,
    };
    const mockRequest = { user: mockUser } as any;
    const mockResponse = 'Cita actualizada a estado En Camino.';

    jest.spyOn(startCitaUseCase, 'execute').mockResolvedValue(mockResponse);

    const result = await controller.startCita(citaId, mockRequest);

    // Verifica que el controlador envíe req.user en lugar del parámetro userId
    expect(startCitaUseCase.execute).toHaveBeenCalledWith(citaId, mockUser);
    expect(result).toBe(mockResponse);
  });

  // =========================================================================
  // REGLAS DE NEGOCIO Y EXCEPCIONES PROPAGADAS
  // =========================================================================

  it('debe propagar NotFoundException si la cita a iniciar no existe', async () => {
    const citaId = 999;
    const mockRequest = { user: { userId: 3 } } as any;

    jest
      .spyOn(startCitaUseCase, 'execute')
      .mockRejectedValue(new NotFoundException('La cita #999 no existe.'));

    await expect(controller.startCita(citaId, mockRequest)).rejects.toThrow(
      NotFoundException,
    );
    expect(startCitaUseCase.execute).toHaveBeenCalledWith(
      citaId,
      mockRequest.user,
    );
  });

  it('debe propagar BadRequestException si la cita no está en estado PENDIENTE', async () => {
    const citaId = 1;
    const mockRequest = { user: { userId: 3 } } as any;

    jest
      .spyOn(startCitaUseCase, 'execute')
      .mockRejectedValue(
        new BadRequestException(
          "Solo se pueden pasar a 'En Camino' citas en estado PENDIENTE. Estado actual: EN_CAMINO.",
        ),
      );

    await expect(controller.startCita(citaId, mockRequest)).rejects.toThrow(
      BadRequestException,
    );
    expect(startCitaUseCase.execute).toHaveBeenCalledWith(
      citaId,
      mockRequest.user,
    );
  });

  it('debe propagar NotFoundException si el usuario autenticado no existe en la BD', async () => {
    const citaId = 1;
    const mockRequest = { user: { userId: 888 } } as any;

    jest
      .spyOn(startCitaUseCase, 'execute')
      .mockRejectedValue(
        new NotFoundException('El usuario #888 no fue encontrado.'),
      );

    await expect(controller.startCita(citaId, mockRequest)).rejects.toThrow(
      NotFoundException,
    );
    expect(startCitaUseCase.execute).toHaveBeenCalledWith(
      citaId,
      mockRequest.user,
    );
  });

  it('debe propagar ForbiddenException si el usuario autenticado no tiene permisos para la cita', async () => {
    const citaId = 1;
    const mockRequest = { user: { userId: 10 } } as any;

    jest
      .spyOn(startCitaUseCase, 'execute')
      .mockRejectedValue(
        new ForbiddenException(
          'No tienes permisos para cambiar el estado de la cita #1.',
        ),
      );

    await expect(controller.startCita(citaId, mockRequest)).rejects.toThrow(
      ForbiddenException,
    );
    expect(startCitaUseCase.execute).toHaveBeenCalledWith(
      citaId,
      mockRequest.user,
    );
  });

  // =========================================================================
  // VERIFICACIÓN DE SEGURIDAD (@Roles DECORATOR METADATA)
  // =========================================================================

  it('debe verificar mediante Reflector que los roles autorizados en el endpoint sean ADMINISTRADOR y SOPORTE_INSITU', () => {
    const roles = reflector.get<string[]>(
      'roles',
      CitasController.prototype.startCita,
    );

    expect(roles).toBeDefined();
    expect(roles).toEqual(
      expect.arrayContaining(['ADMINISTRADOR', 'SOPORTE_INSITU']),
    );
  });

  it('no debe permitir el acceso a perfiles no autorizados como los clientes o soporte remoto', () => {
    const roles = reflector.get<string[]>(
      'roles',
      CitasController.prototype.startCita,
    );

    expect(roles).not.toContain('CLIENTE_EMPRESA');
    expect(roles).not.toContain('CLIENTE_SUCURSAL');
    expect(roles).not.toContain('CLIENTE_TRABAJADOR');
    expect(roles).not.toContain('SOPORTE_TECNICO');
  });
});
