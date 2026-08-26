import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';

// 1. Controladores y Casos de Uso bajo prueba
import { CitasController } from '../citas.controller';
import { CronogramaCitaUseCase } from '../application/cronograma-cita.use-case';

// 2. Casos de Uso secundarios mockeados (requeridos para que el Nest Testing Module resuelva el constructor de CitasController)
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
    // Configuración del módulo de pruebas aislado de NestJS
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CitasController],
      providers: [
        Reflector,
        {
          // Inyectamos un spy en la función execute para simular diferentes respuestas del caso de uso
          provide: CronogramaCitaUseCase,
          useValue: { execute: jest.fn() },
        },
        // Proveemos objetos vacíos para las demás dependencias que el controlador inyecta pero que no ejecutamos en este suite
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

    // Obtenemos las instancias desde el módulo compilado
    controller = module.get<CitasController>(CitasController);
    cronogramaCitaUseCase = module.get<CronogramaCitaUseCase>(
      CronogramaCitaUseCase,
    );
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => {
    // Limpiamos los contadores e llamadas registradas por los mocks entre cada 'it'
    jest.clearAllMocks();
  });

  // =========================================================================
  // BLOQUE 1: VERIFICACIÓN DE EJECUCIÓN Y ALCANCE DE INFORMACIÓN POR ROL
  // =========================================================================
  // Estos tests aseguran que el controlador pasa la información del usuario
  // autenticado (extraída del JWT) al caso de uso de manera transparente,
  // permitiendo que este filtre los datos según el alcance (scope) de cada rol.

  it('debe permitir a un ADMINISTRADOR consultar y recibir todas las citas globales', async () => {
    // Simula el objeto req.user que inyecta el JwtAuthGuard para un Administrador
    const mockRequest = { user: { userId: 1, role: 'ADMINISTRADOR' } };

    // Respuesta esperada: Vista global sin restricciones de cliente o sucursal
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

    // Valida que el controlador entregue todo el objeto de usuario al caso de uso
    expect(cronogramaCitaUseCase.execute).toHaveBeenCalledWith(
      mockRequest.user,
    );
    // Valida que el controlador retorne exactamente la lista global procesada
    expect(result).toEqual(mockGlobalResponse);
  });

  it('debe permitir a SOPORTE_INSITU recibir las citas asignadas a su usuario', async () => {
    // Usuario autenticado con rol de Soporte In Situ
    const mockRequest = { user: { userId: 3, role: 'SOPORTE_INSITU' } };

    // Respuesta esperada: Citas filtradas donde el soporte asignado coincide con el id del usuario
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
    // Usuario cliente a nivel empresa con id_cliente vinculado
    const mockRequest = {
      user: { userId: 4, role: 'CLIENTE_EMPRESA', id_cliente: 10 },
    };

    // Respuesta esperada: Citas pertenecientes a todas las sucursales de la empresa #10
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
    // Encargado de sucursal con un id_sucursal delimitado
    const mockRequest = {
      user: { userId: 5, role: 'CLIENTE_SUCURSAL', id_sucursal: 2 },
    };

    // Respuesta esperada: Exclusivamente las citas programadas para la sucursal #2
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
    // Trabajador regular con ámbito restringido a la sucursal asignada
    const mockRequest = {
      user: { userId: 6, role: 'CLIENTE_TRABAJADOR', id_sucursal: 2 },
    };

    // Respuesta esperada: Citas visibles para los trabajadores de la sucursal #2
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
  // Garantizan mediante Reflector que el decorador @Roles haya registrado
  // la lista de roles autorizados en el prototipo del método del controlador.

  it('debe verificar que los metadatos de @Roles incluyan los 5 roles autorizados', () => {
    // Extrae los metadatos 'roles' asociados a la función 'cronograma' del controlador
    const roles = reflector.get<string[]>(
      'roles',
      CitasController.prototype.cronograma,
    );

    // Valida que el decorador esté configurado y contenga exactamente los 5 roles permitidos
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
    // Verifica las restricciones negativas de acceso (principio de menor privilegio)
    const roles = reflector.get<string[]>(
      'roles',
      CitasController.prototype.cronograma,
    );

    // Confirma que el rol de soporte remoto/técnico regular NO tiene permiso en la ruta
    expect(roles).not.toContain('SOPORTE_TECNICO');
  });
});
