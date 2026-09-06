import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';

// Controladores y Casos de Uso bajo prueba
import { CitasController } from '../citas.controller';
import { CronogramaCitaUseCase } from '../application/cronograma-cita.use-case';

// Casos de Uso secundarios mockeados
import { CreateCitaUseCase } from '../application/create-cita.use-case';
import { FindAllCitaUseCase } from '../application/find-all-cita.use-case';
import { FindOneCitaUseCase } from '../application/find-one-cita.use-case';
import { RelocateCitaUseCase } from '../application/relocate-cita.use-case';
import { UpdateCitaUseCase } from '../application/update-cita.use-case';
import { AddTicketsToCitaUseCase } from '../application/add-tickets-to-cita.use-case';
import { StartCitaUseCase } from '../application/start-cita.use-case';
import { CompleteCitaUseCase } from '../application/complete-cita.use-case';
import { CancelCitaUseCase } from '../application/cancel-cita.use-case';

describe('CitasController - GET /citas/cronograma (Cronograma de Citas)', () => {
  let controller: CitasController;
  let cronogramaCitaUseCase: CronogramaCitaUseCase;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CitasController],
      providers: [
        Reflector,
        {
          provide: CronogramaCitaUseCase,
          useValue: { execute: jest.fn() },
        },
        { provide: CreateCitaUseCase, useValue: {} },
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
    cronogramaCitaUseCase = module.get<CronogramaCitaUseCase>(
      CronogramaCitaUseCase,
    );
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================================
  // BLOQUE 1: VERIFICACIÓN DE EJECUCIÓN Y ALCANCE DE INFORMACIÓN POR ROL
  // =========================================================================

  it('debe permitir a un ADMINISTRADOR consultar y recibir todas las citas globales', async () => {
    const mockRequest = { user: { userId: 1, role: 'ADMINISTRADOR' } };
    const mockGlobalResponse = [
      {
        id_cita: 1,
        nombre_cliente: 'Empresa A',
        nombre_sucursal: 'Sucursal Central',
      },
    ];

    jest
      .spyOn(cronogramaCitaUseCase, 'execute')
      .mockResolvedValue(mockGlobalResponse as any);

    const result = await controller.cronograma(mockRequest as any);

    expect(cronogramaCitaUseCase.execute).toHaveBeenCalledWith(
      mockRequest.user,
    );
    expect(result).toEqual(mockGlobalResponse);
  });

  it('debe permitir a SOPORTE_INSITU recibir las citas asignadas a su usuario', async () => {
    const mockRequest = { user: { userId: 3, role: 'SOPORTE_INSITU' } };
    const mockSoporteResponse = [
      { id_cita: 1, nombre_cliente: 'Empresa A', id_soporte: 3 },
    ];

    jest
      .spyOn(cronogramaCitaUseCase, 'execute')
      .mockResolvedValue(mockSoporteResponse as any);

    const result = await controller.cronograma(mockRequest as any);

    expect(cronogramaCitaUseCase.execute).toHaveBeenCalledWith(
      mockRequest.user,
    );
    expect(result).toEqual(mockSoporteResponse);
  });

  it('debe permitir a CLIENTE_EMPRESA recibir únicamente las citas de su empresa', async () => {
    const mockRequest = {
      user: { userId: 4, role: 'CLIENTE_EMPRESA', id_cliente: 10 },
    };

    const mockEmpresaResponse = [
      { id_cita: 1, id_cliente: 10, nombre_cliente: 'Mi Empresa SAC' },
    ];

    jest
      .spyOn(cronogramaCitaUseCase, 'execute')
      .mockResolvedValue(mockEmpresaResponse as any);

    const result = await controller.cronograma(mockRequest as any);

    expect(cronogramaCitaUseCase.execute).toHaveBeenCalledWith(
      mockRequest.user,
    );
    expect(result).toEqual(mockEmpresaResponse);
  });

  it('debe permitir a CLIENTE_SUCURSAL recibir únicamente las citas asociadas a su sucursal', async () => {
    const mockRequest = {
      user: { userId: 5, role: 'CLIENTE_SUCURSAL', id_sucursal: 2 },
    };

    const mockSucursalResponse = [
      { id_cita: 3, id_sucursal: 2, nombre_sucursal: 'Sucursal Sur' },
    ];

    jest
      .spyOn(cronogramaCitaUseCase, 'execute')
      .mockResolvedValue(mockSucursalResponse as any);

    const result = await controller.cronograma(mockRequest as any);

    expect(cronogramaCitaUseCase.execute).toHaveBeenCalledWith(
      mockRequest.user,
    );
    expect(result).toEqual(mockSucursalResponse);
  });

  it('debe permitir a CLIENTE_TRABAJADOR recibir las citas correspondientes a su sucursal', async () => {
    const mockRequest = {
      user: { userId: 6, role: 'CLIENTE_TRABAJADOR', id_sucursal: 2 },
    };

    const mockTrabajadorResponse = [
      { id_cita: 3, id_sucursal: 2, nombre_sucursal: 'Sucursal Sur' },
    ];

    jest
      .spyOn(cronogramaCitaUseCase, 'execute')
      .mockResolvedValue(mockTrabajadorResponse as any);

    const result = await controller.cronograma(mockRequest as any);

    expect(cronogramaCitaUseCase.execute).toHaveBeenCalledWith(
      mockRequest.user,
    );
    expect(result).toEqual(mockTrabajadorResponse);
  });

  // =========================================================================
  // BLOQUE 2: VERIFICACIÓN DE SEGURIDAD (@Roles DECORATOR METADATA)
  // =========================================================================

  it('debe verificar que los metadatos de @Roles incluyan los 5 roles autorizados', () => {
    const roles = reflector.get<string[]>(
      'roles',
      CitasController.prototype.cronograma,
    );

    expect(roles).toBeDefined();
    expect(roles).toEqual(
      expect.arrayContaining([
        'ADMINISTRADOR',
        'SOPORTE_INSITU',
        'CLIENTE_EMPRESA',
        'CLIENTE_SUCURSAL',
        'CLIENTE_TRABAJADOR',
      ]),
    );
  });

  it('no debe incluir al rol SOPORTE_TECNICO en los metadatos del endpoint', () => {
    const roles = reflector.get<string[]>(
      'roles',
      CitasController.prototype.cronograma,
    );

    expect(roles).not.toContain('SOPORTE_TECNICO');
  });
});
