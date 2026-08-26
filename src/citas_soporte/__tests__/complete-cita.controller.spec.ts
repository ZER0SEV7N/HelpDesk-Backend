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
import { CompleteCitaUseCase } from '../application/complete-cita.use-case';
import { CompleteCitaDto } from '../dto/complete-cita.dto';
import { JwtPayload } from '@/common/guards/jwt-auth.guard';

// 2. Mocks de los demás casos de uso requeridos por CitasController
import { CreateCitaUseCase } from '../application/create-cita.use-case';
import { CronogramaCitaUseCase } from '../application/cronograma-cita.use-case';
import { FindAllCitaUseCase } from '../application/find-all-cita.use-case';
import { FindOneCitaUseCase } from '../application/find-one-cita.use-case';
import { RelocateCitaUseCase } from '../application/relocate-cita.use-case';
import { UpdateCitaUseCase } from '../application/update-cita.use-case';
import { AddTicketsToCitaUseCase } from '../application/add-tickets-to-cita.use-case';
import { StartCitaUseCase } from '../application/start-cita.use-case';
import { CancelCitaUseCase } from '../application/cancel-cita.use-case';

describe('CitasController - POST /citas/complete/:id (Completar Cita)', () => {
  let controller: CitasController;
  let completeCitaUseCase: CompleteCitaUseCase;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CitasController],
      providers: [
        Reflector,
        {
          provide: CompleteCitaUseCase,
          useValue: { execute: jest.fn() },
        },
        { provide: CreateCitaUseCase, useValue: {} },
        { provide: CronogramaCitaUseCase, useValue: {} },
        { provide: FindAllCitaUseCase, useValue: {} },
        { provide: FindOneCitaUseCase, useValue: {} },
        { provide: RelocateCitaUseCase, useValue: {} },
        { provide: UpdateCitaUseCase, useValue: {} },
        { provide: AddTicketsToCitaUseCase, useValue: {} },
        { provide: StartCitaUseCase, useValue: {} },
        { provide: CancelCitaUseCase, useValue: {} },
      ],
    }).compile();

    controller = module.get<CitasController>(CitasController);
    completeCitaUseCase = module.get<CompleteCitaUseCase>(CompleteCitaUseCase);
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================================
  // CASO DE ÉXITO (HAPPY PATH)
  // =========================================================================
  it('debe marcar la cita como completada y cerrar los tickets vinculados', async () => {
    const citaId = 1;
    const mockUser: JwtPayload = {
      userId: 3,
      clienteId: 1,
      sub: 3,
      role: 'SOPORTE_INSITU',
    };
    const mockRequest = { user: mockUser } as any;
    const dto: CompleteCitaDto = {
      observaciones_cierre: 'Trabajo finalizado correctamente',
    };

    const mockResponse =
      'Cita completada y tickets asociados cerrados exitosamente.';

    jest.spyOn(completeCitaUseCase, 'execute').mockResolvedValue(mockResponse);

    // Orden de parámetros del controlador: (id_cita, req, dto)
    const result = await controller.completeCita(citaId, mockRequest, dto);

    expect(completeCitaUseCase.execute).toHaveBeenCalledWith(
      citaId,
      mockUser,
      dto,
    );
    expect(result).toBe(mockResponse);
  });

  // =========================================================================
  // REGLAS DE NEGOCIO Y EXCEPCIONES PROPAGADAS
  // =========================================================================

  it('debe propagar NotFoundException si la cita a completar no existe', async () => {
    const citaId = 999;
    const mockRequest = { user: { userId: 3 } } as any;
    const dto: CompleteCitaDto = { observaciones_cierre: 'Cierre prueba' };

    jest
      .spyOn(completeCitaUseCase, 'execute')
      .mockRejectedValue(new NotFoundException('La cita #999 no existe.'));

    await expect(
      controller.completeCita(citaId, mockRequest, dto),
    ).rejects.toThrow(NotFoundException);
    expect(completeCitaUseCase.execute).toHaveBeenCalledWith(
      citaId,
      mockRequest.user,
      dto,
    );
  });

  it('debe propagar BadRequestException si la cita no está en estado EN_CAMINO o PENDIENTE', async () => {
    const citaId = 1;
    const mockRequest = { user: { userId: 3 } } as any;
    const dto: CompleteCitaDto = { observaciones_cierre: 'Intento de cierre' };

    jest
      .spyOn(completeCitaUseCase, 'execute')
      .mockRejectedValue(
        new BadRequestException(
          'No se puede completar una cita con estado CANCELADA.',
        ),
      );

    await expect(
      controller.completeCita(citaId, mockRequest, dto),
    ).rejects.toThrow(BadRequestException);
    expect(completeCitaUseCase.execute).toHaveBeenCalledWith(
      citaId,
      mockRequest.user,
      dto,
    );
  });

  it('debe propagar NotFoundException si el usuario autenticado no existe en la BD', async () => {
    const citaId = 1;
    const mockRequest = { user: { userId: 888 } } as any;
    const dto: CompleteCitaDto = { observaciones_cierre: 'Cierre invalido' };

    jest
      .spyOn(completeCitaUseCase, 'execute')
      .mockRejectedValue(
        new NotFoundException('El usuario #888 no fue encontrado.'),
      );

    await expect(
      controller.completeCita(citaId, mockRequest, dto),
    ).rejects.toThrow(NotFoundException);
    expect(completeCitaUseCase.execute).toHaveBeenCalledWith(
      citaId,
      mockRequest.user,
      dto,
    );
  });

  it('debe propagar ForbiddenException si el usuario no tiene permisos sobre la cita', async () => {
    const citaId = 1;
    const mockRequest = { user: { userId: 10 } } as any;
    const dto: CompleteCitaDto = { observaciones_cierre: 'Sin permisos' };

    jest
      .spyOn(completeCitaUseCase, 'execute')
      .mockRejectedValue(
        new ForbiddenException('No tienes permisos para completar la cita #1.'),
      );

    await expect(
      controller.completeCita(citaId, mockRequest, dto),
    ).rejects.toThrow(ForbiddenException);
    expect(completeCitaUseCase.execute).toHaveBeenCalledWith(
      citaId,
      mockRequest.user,
      dto,
    );
  });

  // =========================================================================
  // VERIFICACIÓN DE SEGURIDAD (@Roles DECORATOR METADATA)
  // =========================================================================

  it('debe verificar mediante Reflector que los roles autorizados sean ADMINISTRADOR y SOPORTE_INSITU', () => {
    const roles = reflector.get<string[]>(
      'roles',
      CitasController.prototype.completeCita,
    );

    expect(roles).toBeDefined();
    expect(roles).toEqual(
      expect.arrayContaining(['ADMINISTRADOR', 'SOPORTE_INSITU']),
    );
  });

  it('no debe permitir el acceso a roles no autorizados', () => {
    const roles = reflector.get<string[]>(
      'roles',
      CitasController.prototype.completeCita,
    );

    expect(roles).not.toContain('CLIENTE_EMPRESA');
    expect(roles).not.toContain('CLIENTE_SUCURSAL');
    expect(roles).not.toContain('CLIENTE_TRABAJADOR');
    expect(roles).not.toContain('SOPORTE_TECNICO');
  });
});
