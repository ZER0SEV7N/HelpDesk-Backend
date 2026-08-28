import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { NotFoundException, BadRequestException } from '@nestjs/common';

// Controlador, DTO y Caso de Uso principal bajo prueba
import { CitasController } from '../citas.controller';
import { UpdateCitaUseCase } from '../application/update-cita.use-case';
import { UpdateCitaDto } from '../dto/update-cita-dto';

// Mocks de los demás casos de uso requeridos por CitasController
import { CreateCitaUseCase } from '../application/create-cita.use-case';
import { CronogramaCitaUseCase } from '../application/cronograma-cita.use-case';
import { FindAllCitaUseCase } from '../application/find-all-cita.use-case';
import { FindOneCitaUseCase } from '../application/find-one-cita.use-case';
import { RelocateCitaUseCase } from '../application/relocate-cita.use-case';
import { AddTicketsToCitaUseCase } from '../application/add-tickets-to-cita.use-case';
import { StartCitaUseCase } from '../application/start-cita.use-case';
import { CompleteCitaUseCase } from '../application/complete-cita.use-case';
import { CancelCitaUseCase } from '../application/cancel-cita.use-case';

describe('CitasController - PATCH /citas/:id (Actualizar Cita)', () => {
  let controller: CitasController;
  let updateCitaUseCase: UpdateCitaUseCase;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CitasController],
      providers: [
        Reflector,
        {
          provide: UpdateCitaUseCase,
          useValue: { execute: jest.fn() },
        },
        { provide: CreateCitaUseCase, useValue: {} },
        { provide: CronogramaCitaUseCase, useValue: {} },
        { provide: FindAllCitaUseCase, useValue: {} },
        { provide: FindOneCitaUseCase, useValue: {} },
        { provide: RelocateCitaUseCase, useValue: {} },
        { provide: AddTicketsToCitaUseCase, useValue: {} },
        { provide: StartCitaUseCase, useValue: {} },
        { provide: CompleteCitaUseCase, useValue: {} },
        { provide: CancelCitaUseCase, useValue: {} },
      ],
    }).compile();

    controller = module.get<CitasController>(CitasController);
    updateCitaUseCase = module.get<UpdateCitaUseCase>(UpdateCitaUseCase);
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================================
  // CASO DE ÉXITO (HAPPY PATH)
  // =========================================================================
  it('debe actualizar los datos parciales de una cita exitosamente', async () => {
    const citaId = 1;
    const dto: UpdateCitaDto = {
      observaciones: 'Nueva observación actualizada',
      id_soporte_insitu: 2,
    };

    const mockResponse = 'La cita con ID #1 ha sido actualizada exitosamente.';

    jest.spyOn(updateCitaUseCase, 'execute').mockResolvedValue(mockResponse);

    const result = await controller.update(citaId, dto);

    expect(updateCitaUseCase.execute).toHaveBeenCalledWith(citaId, dto);
    expect(result).toBe(mockResponse);
  });

  // =========================================================================
  // REGLAS DE NEGOCIO Y EXCEPCIONES PROPAGADAS
  // =========================================================================
  it('debe propagar NotFoundException si la cita a actualizar no existe', async () => {
    const citaId = 999;
    const dto: UpdateCitaDto = { observaciones: 'Test no existente' };

    jest
      .spyOn(updateCitaUseCase, 'execute')
      .mockRejectedValue(
        new NotFoundException('La cita con ID #999 no fue encontrada.'),
      );

    await expect(controller.update(citaId, dto)).rejects.toThrow(
      NotFoundException,
    );
    expect(updateCitaUseCase.execute).toHaveBeenCalledWith(citaId, dto);
  });

  it('debe propagar BadRequestException si la cita no está en estado PENDIENTE', async () => {
    const citaId = 1;
    const dto: UpdateCitaDto = { observaciones: 'Intento de edicion' };

    jest
      .spyOn(updateCitaUseCase, 'execute')
      .mockRejectedValue(
        new BadRequestException(
          "No se puede modificar una cita en estado 'EN_CAMINO'. Usa el flujo específico correspondiente.",
        ),
      );

    await expect(controller.update(citaId, dto)).rejects.toThrow(
      BadRequestException,
    );
    expect(updateCitaUseCase.execute).toHaveBeenCalledWith(citaId, dto);
  });

  it('debe propagar NotFoundException si el nuevo técnico no existe o no tiene el rol SOPORTE_INSITU', async () => {
    const citaId = 1;
    const dto: UpdateCitaDto = { id_soporte_insitu: 888 };

    jest
      .spyOn(updateCitaUseCase, 'execute')
      .mockRejectedValue(
        new NotFoundException(
          'El usuario con ID #888 no existe o no cuenta con el rol SOPORTE_INSITU.',
        ),
      );

    await expect(controller.update(citaId, dto)).rejects.toThrow(
      NotFoundException,
    );
    expect(updateCitaUseCase.execute).toHaveBeenCalledWith(citaId, dto);
  });

  // =========================================================================
  // VERIFICACIÓN DE SEGURIDAD (@Roles DECORATOR METADATA)
  // =========================================================================
  it('debe verificar mediante Reflector que los roles autorizados sean ADMINISTRADOR y SOPORTE_INSITU', () => {
    const roles = reflector.get<string[]>(
      'roles',
      CitasController.prototype.update,
    );

    expect(roles).toBeDefined();
    expect(roles).toEqual(
      expect.arrayContaining(['ADMINISTRADOR', 'SOPORTE_INSITU']),
    );
  });

  it('no debe permitir el acceso a roles no autorizados (Clientes o Soporte Remoto)', () => {
    const roles = reflector.get<string[]>(
      'roles',
      CitasController.prototype.update,
    );

    expect(roles).not.toContain('CLIENTE_EMPRESA');
    expect(roles).not.toContain('CLIENTE_SUCURSAL');
    expect(roles).not.toContain('CLIENTE_TRABAJADOR');
    expect(roles).not.toContain('SOPORTE_TECNICO');
  });
});
