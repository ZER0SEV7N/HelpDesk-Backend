import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import {
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

// Controlador, DTO y JwtPayload
import { CitasController } from '../citas.controller';
import { CancelCitaUseCase } from '../application/cancel-cita.use-case';
import { CancelCitaDto } from '../dto/cancel-cita.dto';
import { JwtPayload } from '@/common/guards/jwt-auth.guard';

// Mocks de los demás casos de uso requeridos por CitasController
import { CreateCitaUseCase } from '../application/create-cita.use-case';
import { CronogramaCitaUseCase } from '../application/cronograma-cita.use-case';
import { FindAllCitaUseCase } from '../application/find-all-cita.use-case';
import { FindOneCitaUseCase } from '../application/find-one-cita.use-case';
import { RelocateCitaUseCase } from '../application/relocate-cita.use-case';
import { UpdateCitaUseCase } from '../application/update-cita.use-case';
import { AddTicketsToCitaUseCase } from '../application/add-tickets-to-cita.use-case';
import { StartCitaUseCase } from '../application/start-cita.use-case';
import { CompleteCitaUseCase } from '../application/complete-cita.use-case';

describe('CitasController - POST /citas/cancel/:id/:userId (Cancelar Cita)', () => {
  let controller: CitasController;
  let cancelCitaUseCase: CancelCitaUseCase;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CitasController],
      providers: [
        Reflector,
        {
          provide: CancelCitaUseCase,
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
        { provide: CompleteCitaUseCase, useValue: {} },
      ],
    }).compile();

    controller = module.get<CitasController>(CitasController);
    cancelCitaUseCase = module.get<CancelCitaUseCase>(CancelCitaUseCase);
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================================
  // CASO DE ÉXITO (HAPPY PATH)
  // =========================================================================
  it('debe cancelar una cita pendiente exitosamente cuando los datos y permisos son válidos', async () => {
    const citaId = 1;
    const mockUser: JwtPayload = {
      userId: 3,
      sub: 3,
      role: 'SOPORTE_INSITU',
    };
    const mockRequest = { user: mockUser } as any;
    const dto: CancelCitaDto = {
      motivo_cancelacion: 'Cliente no asistió y no responde a las llamadas.',
    };
    const mockResponse = 'Cita cancelada exitosamente';

    jest.spyOn(cancelCitaUseCase, 'execute').mockResolvedValue(mockResponse);

    const result = await controller.cancelCita(citaId, mockRequest, dto);

    // Verifica que se pase citaId, mockUser (JwtPayload) y el DTO
    expect(cancelCitaUseCase.execute).toHaveBeenCalledWith(
      citaId,
      mockUser,
      dto,
    );
    expect(result).toBe(mockResponse);
  });

  // =========================================================================
  // REGLAS DE NEGOCIO Y EXCEPCIONES PROPAGADAS
  // =========================================================================

  it('debe propagar NotFoundException si la cita a cancelar no existe en la BD', async () => {
    const citaId = 999;
    const mockUser: JwtPayload = {
      userId: 3,
      sub: 3,
      role: 'SOPORTE_INSITU',
    };
    const mockRequest = { user: mockUser } as any;
    const dto: CancelCitaDto = {
      motivo_cancelacion: 'Cancelación de cita inexistente',
    };

    jest
      .spyOn(cancelCitaUseCase, 'execute')
      .mockRejectedValue(new NotFoundException('La cita #999 no existe.'));

    await expect(
      controller.cancelCita(citaId, mockRequest, dto),
    ).rejects.toThrow(NotFoundException);

    expect(cancelCitaUseCase.execute).toHaveBeenCalledWith(
      citaId,
      mockUser,
      dto,
    );
  });

  it('debe propagar BadRequestException si la cita no está en estado PENDIENTE', async () => {
    const citaId = 1;
    const mockUser: JwtPayload = {
      userId: 3,
      sub: 3,
      role: 'SOPORTE_INSITU',
    };
    const mockRequest = { user: mockUser } as any;
    const dto: CancelCitaDto = {
      motivo_cancelacion: 'Intento de cancelar cita en progreso',
    };

    jest
      .spyOn(cancelCitaUseCase, 'execute')
      .mockRejectedValue(
        new BadRequestException(
          'La cita #1 no puede ser cancelada porque no está en estado PENDIENTE.',
        ),
      );

    await expect(
      controller.cancelCita(citaId, mockRequest, dto),
    ).rejects.toThrow(BadRequestException);

    expect(cancelCitaUseCase.execute).toHaveBeenCalledWith(
      citaId,
      mockUser,
      dto,
    );
  });

  it('debe propagar NotFoundException si el usuario que intenta cancelar no existe', async () => {
    const citaId = 1;
    const mockUser: JwtPayload = {
      userId: 888,
      role: 'SOPORTE_INSITU',
      sub: 888,
    };
    const mockRequest = { user: mockUser } as any;
    const dto: CancelCitaDto = {
      motivo_cancelacion: 'Cancelación por usuario no registrado',
    };

    jest
      .spyOn(cancelCitaUseCase, 'execute')
      .mockRejectedValue(new NotFoundException('El usuario #888 no existe.'));

    await expect(
      controller.cancelCita(citaId, mockRequest, dto),
    ).rejects.toThrow(NotFoundException);

    expect(cancelCitaUseCase.execute).toHaveBeenCalledWith(
      citaId,
      mockUser,
      dto,
    );
  });

  it('debe propagar ForbiddenException si el usuario no tiene permisos', async () => {
    const citaId = 1;
    const mockUser: JwtPayload = {
      userId: 5,
      sub: 5,
      role: 'SOPORTE_INSITU',
    };
    const mockRequest = { user: mockUser } as any;
    const dto: CancelCitaDto = {
      motivo_cancelacion: 'Solicitud no autorizada',
    };

    jest
      .spyOn(cancelCitaUseCase, 'execute')
      .mockRejectedValue(
        new ForbiddenException(
          'No tienes permisos para cancelar la cita #1. Solo el soporte asignado o un Administrador pueden hacerlo.',
        ),
      );

    await expect(
      controller.cancelCita(citaId, mockRequest, dto),
    ).rejects.toThrow(ForbiddenException);

    expect(cancelCitaUseCase.execute).toHaveBeenCalledWith(
      citaId,
      mockUser,
      dto,
    );
  });

  // =========================================================================
  // VERIFICACIÓN DE SEGURIDAD (@Roles DECORATOR METADATA)
  // =========================================================================

  it('debe verificar mediante Reflector que los roles autorizados sean ADMINISTRADOR y SOPORTE_INSITU', () => {
    const roles = reflector.get<string[]>(
      'roles',
      CitasController.prototype.cancelCita,
    );

    expect(roles).toBeDefined();
    expect(roles).toEqual(
      expect.arrayContaining(['ADMINISTRADOR', 'SOPORTE_INSITU']),
    );
  });

  it('no debe permitir que roles no autorizados accedan al endpoint de cancelación', () => {
    const roles = reflector.get<string[]>(
      'roles',
      CitasController.prototype.cancelCita,
    );

    expect(roles).not.toContain('CLIENTE_EMPRESA');
    expect(roles).not.toContain('CLIENTE_SUCURSAL');
    expect(roles).not.toContain('CLIENTE_TRABAJADOR');
    expect(roles).not.toContain('SOPORTE_TECNICO');
  });
});
