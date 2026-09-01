import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';

// Controlador y Caso de Uso principal bajo prueba
import { CitasController } from '../citas.controller';
import { FindAllCitaUseCase } from '../application/find-all-cita.use-case';

// Mocks de los demás casos de uso requeridos por CitasController
import { CreateCitaUseCase } from '../application/create-cita.use-case';
import { CronogramaCitaUseCase } from '../application/cronograma-cita.use-case';
import { FindOneCitaUseCase } from '../application/find-one-cita.use-case';
import { RelocateCitaUseCase } from '../application/relocate-cita.use-case';
import { UpdateCitaUseCase } from '../application/update-cita.use-case';
import { AddTicketsToCitaUseCase } from '../application/add-tickets-to-cita.use-case';
import { StartCitaUseCase } from '../application/start-cita.use-case';
import { CompleteCitaUseCase } from '../application/complete-cita.use-case';
import { CancelCitaUseCase } from '../application/cancel-cita.use-case';

describe('CitasController - GET /citas (Listar Citas)', () => {
  let controller: CitasController;
  let findAllCitasUseCase: FindAllCitaUseCase;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CitasController],
      providers: [
        Reflector,
        {
          provide: FindAllCitaUseCase,
          useValue: { execute: jest.fn() },
        },
        { provide: CreateCitaUseCase, useValue: {} },
        { provide: CronogramaCitaUseCase, useValue: {} },
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
    findAllCitasUseCase = module.get<FindAllCitaUseCase>(FindAllCitaUseCase);
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // BLOQUE 1: PRUEBAS DE EJECUCIÓN Y MAPPING DE RESPUESTAS
  // ==========================================

  it('debe permitir a un ADMINISTRADOR listar todas las citas formateadas según el DTO', async () => {
    const mockRequest = {
      user: {
        userId: 1,
        correo: 'admin@empresa.com',
        role: 'ADMINISTRADOR',
      },
    };

    const mockCitasResponse = [
      {
        id_cita: 1,
        fecha_programada: new Date('2026-08-25'),
        estado: 'Pendiente',
        observaciones: 'Sin observaciones',
        created_at: new Date(),
        updated_at: new Date(),
        sucursal: {
          id_sucursal: 1,
          nombre_sucursal: 'Sucursal Central',
          direccion: 'Av. Principal',
        },
        area: { id_area: 1, nombre_area: 'Sistemas' },
        soporte_insitu: {
          id_usuario: 2,
          nombre_completo: 'Juan Perez',
          correo: 'juan@empresa.com',
          telefono: '987654321',
        },
        tickets: [
          {
            id_ticket: 10,
            pin: 'TCK-01',
            asunto: 'Fallo Red',
            detalle: 'Sin señal',
            estado: 'Abierto',
          },
        ],
      },
    ];

    jest
      .spyOn(findAllCitasUseCase, 'execute')
      .mockResolvedValue(mockCitasResponse as any);

    const result = await controller.findAll(mockRequest as any);

    expect(findAllCitasUseCase.execute).toHaveBeenCalledWith(mockRequest.user);
    expect(result).toEqual(mockCitasResponse);
  });

  it('debe permitir a un SOPORTE_INSITU listar únicamente sus citas asignadas', async () => {
    const mockRequest = {
      user: {
        userId: 3,
        correo: 'soporte@empresa.com',
        role: 'SOPORTE_INSITU',
      },
    };

    const mockCitasResponse = [
      {
        id_cita: 2,
        fecha_programada: new Date('2026-08-26'),
        estado: 'En Proceso',
        observaciones: null,
        created_at: new Date(),
        updated_at: new Date(),
        sucursal: {
          id_sucursal: 2,
          nombre_sucursal: 'Norte',
          direccion: 'Av. Lima',
        },
        area: { id_area: 2, nombre_area: 'Soporte' },
        soporte_insitu: {
          id_usuario: 3,
          nombre_completo: 'Carlos Ruiz',
          correo: 'soporte@empresa.com',
          telefono: '912345678',
        },
        tickets: [],
      },
    ];

    jest
      .spyOn(findAllCitasUseCase, 'execute')
      .mockResolvedValue(mockCitasResponse as any);

    const result = await controller.findAll(mockRequest as any);

    expect(findAllCitasUseCase.execute).toHaveBeenCalledWith(mockRequest.user);
    expect(result).toEqual(mockCitasResponse);
  });

  // ==========================================
  // BLOQUE 2: VERIFICACIÓN DE SEGURIDAD Y PERMISOS (DECORADOR @Roles)
  // ==========================================

  it('debe validar la metadata del decorador @Roles en el endpoint findAll', () => {
    const roles = reflector.get<string[]>(
      'roles',
      CitasController.prototype.findAll,
    );

    expect(roles).toBeDefined();
    expect(roles).toEqual(
      expect.arrayContaining(['ADMINISTRADOR', 'SOPORTE_INSITU']),
    );
  });

  it('no debe permitir a los roles de CLIENTE (EMPRESA, SUCURSAL, TRABAJADOR) acceder al endpoint', () => {
    const roles = reflector.get<string[]>(
      'roles',
      CitasController.prototype.findAll,
    );

    expect(roles).not.toContain('CLIENTE_EMPRESA');
    expect(roles).not.toContain('CLIENTE_SUCURSAL');
    expect(roles).not.toContain('CLIENTE_TRABAJADOR');
  });
});
