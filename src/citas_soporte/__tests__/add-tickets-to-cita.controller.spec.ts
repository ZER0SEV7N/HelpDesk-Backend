import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';

// 1. Controlador y Caso de Uso principal bajo prueba
import { CitasController } from '../citas.controller';
import { AddTicketsToCitaUseCase } from '../application/add-tickets-to-cita.use-case';
import { AddTicketsToCitaDto } from '../dto/add-tickets-to-cita.dto';

// 2. Mocks de los demás casos de uso requeridos para resolver la inyección de dependencias de CitasController
import { CreateCitaUseCase } from '../application/create-cita.use-case';
import { CronogramaCitaUseCase } from '../application/cronograma-cita.use-case';
import { FindAllCitaUseCase } from '../application/find-all-cita.use-case';
import { FindOneCitaUseCase } from '../application/find-one-cita.use-case';
import { RelocateCitaUseCase } from '../application/relocate-cita.use-case';
import { UpdateCitaUseCase } from '../application/update-cita.use-case';
import { StartCitaUseCase } from '../application/start-cita.use-case';
import { CompleteCitaUseCase } from '../application/complete-cita.use-case';
import { CancelCitaUseCase } from '../application/cancel-cita.use-case';

describe('CitasController - POST /citas/add-tickets/:id (Agregar Tickets a Cita)', () => {
  let controller: CitasController;
  let addTicketsToCitaUseCase: AddTicketsToCitaUseCase;
  let reflector: Reflector;

  beforeEach(async () => {
    // Configuración del módulo de pruebas de NestJS aislando el controlador
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CitasController],
      providers: [
        Reflector,
        {
          // Inyectamos un spy en la función execute para controlar las respuestas y excepciones del Use Case
          provide: AddTicketsToCitaUseCase,
          useValue: { execute: jest.fn() },
        },
        // Proveemos mocks vacíos para los demás casos de uso que inyecta CitasController en su constructor
        { provide: CreateCitaUseCase, useValue: {} },
        { provide: CronogramaCitaUseCase, useValue: {} },
        { provide: FindAllCitaUseCase, useValue: {} },
        { provide: FindOneCitaUseCase, useValue: {} },
        { provide: RelocateCitaUseCase, useValue: {} },
        { provide: UpdateCitaUseCase, useValue: {} },
        { provide: StartCitaUseCase, useValue: {} },
        { provide: CompleteCitaUseCase, useValue: {} },
        { provide: CancelCitaUseCase, useValue: {} },
      ],
    }).compile();

    // Obtenemos las instancias compiladas desde el módulo de prueba
    controller = module.get<CitasController>(CitasController);
    addTicketsToCitaUseCase = module.get<AddTicketsToCitaUseCase>(
      AddTicketsToCitaUseCase,
    );
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => {
    // Limpiamos los spies y registros de llamadas después de cada prueba
    jest.clearAllMocks();
  });

  // =========================================================================
  // CASO DE ÉXITO (HAPPY PATH)
  // =========================================================================
  it('debe vincular nuevos tickets exitosamente cuando la cita existe y está en estado Pendiente', async () => {
    const citaId = 1;
    const dto: AddTicketsToCitaDto = { ticket_ids: [3, 4] };
    const mockResponse = 'Tickets asociados exitosamente a la cita.';

    // Simula una resolución exitosa del servicio/caso de uso
    jest
      .spyOn(addTicketsToCitaUseCase, 'execute')
      .mockResolvedValue(mockResponse as any);

    const result = await controller.addTicketsToCita(citaId, dto);

    // Valida que el controlador entregue los parámetros correctos al caso de uso
    expect(addTicketsToCitaUseCase.execute).toHaveBeenCalledWith(citaId, dto);
    expect(result).toBe(mockResponse);
  });

  // =========================================================================
  // REGLAS DE NEGOCIO Y EXCEPCIONES PROPAGADAS
  // =========================================================================

  it('debe propagar NotFoundException si la cita especificada por ID no existe en la BD', async () => {
    const citaId = 999;
    const dto: AddTicketsToCitaDto = { ticket_ids: [3, 4] };

    // Simula que el repositorio no encontró la cita con ID #999
    jest
      .spyOn(addTicketsToCitaUseCase, 'execute')
      .mockRejectedValue(new NotFoundException('La cita #999 no existe.'));

    // Verifica que la excepción lanzada por el caso de uso se propague a través del controlador
    await expect(controller.addTicketsToCita(citaId, dto)).rejects.toThrow(
      NotFoundException,
    );
    expect(addTicketsToCitaUseCase.execute).toHaveBeenCalledWith(citaId, dto);
  });

  it('debe propagar BadRequestException si la cita no está en estado Pendiente (ej. En Camino, Completada)', async () => {
    const citaId = 1;
    const dto: AddTicketsToCitaDto = { ticket_ids: [3, 4] };

    // Regla de negocio: Solo se pueden agregar tickets a citas en estado 'Pendiente'
    jest
      .spyOn(addTicketsToCitaUseCase, 'execute')
      .mockRejectedValue(
        new BadRequestException(
          "Solo se pueden asociar tickets a citas en estado 'Pendiente'.",
        ),
      );

    await expect(controller.addTicketsToCita(citaId, dto)).rejects.toThrow(
      BadRequestException,
    );
    expect(addTicketsToCitaUseCase.execute).toHaveBeenCalledWith(citaId, dto);
  });

  it('debe propagar NotFoundException si uno o más IDs de tickets enviados no existen', async () => {
    const citaId = 1;
    const dto: AddTicketsToCitaDto = { ticket_ids: [99, 100] };

    // Regla de negocio: Todos los ticket_ids enviados deben existir en la base de datos
    jest
      .spyOn(addTicketsToCitaUseCase, 'execute')
      .mockRejectedValue(
        new NotFoundException('Uno o más tickets no fueron encontrados.'),
      );

    await expect(controller.addTicketsToCita(citaId, dto)).rejects.toThrow(
      NotFoundException,
    );
    expect(addTicketsToCitaUseCase.execute).toHaveBeenCalledWith(citaId, dto);
  });

  it('debe propagar BadRequestException si se intenta asociar un ticket que ya tiene estado Cerrado', async () => {
    const citaId = 1;
    const dto: AddTicketsToCitaDto = { ticket_ids: [5] };

    // Regla de negocio: Ningún ticket a asociar puede tener estado 'Cerrado'
    jest
      .spyOn(addTicketsToCitaUseCase, 'execute')
      .mockRejectedValue(
        new BadRequestException(
          'El ticket #5 está Cerrado y no se puede asociar.',
        ),
      );

    await expect(controller.addTicketsToCita(citaId, dto)).rejects.toThrow(
      BadRequestException,
    );
    expect(addTicketsToCitaUseCase.execute).toHaveBeenCalledWith(citaId, dto);
  });

  it('debe propagar ConflictException si alguno de los tickets ya pertenece a otra cita activa (Pendiente o En Camino)', async () => {
    const citaId = 1;
    const dto: AddTicketsToCitaDto = { ticket_ids: [3] };

    // Regla de negocio: Ningún ticket puede estar asociado simultáneamente a otra cita en progreso
    jest
      .spyOn(addTicketsToCitaUseCase, 'execute')
      .mockRejectedValue(
        new ConflictException(
          'Uno o más tickets ya se encuentran asociados a otra cita activa.',
        ),
      );

    await expect(controller.addTicketsToCita(citaId, dto)).rejects.toThrow(
      ConflictException,
    );
    expect(addTicketsToCitaUseCase.execute).toHaveBeenCalledWith(citaId, dto);
  });

  // =========================================================================
  // VERIFICACIÓN DE DECORADORES Y METADATOS DE SEGURIDAD
  // =========================================================================

  it('debe verificar mediante Reflector que el endpoint esté protegido con los roles ADMINISTRADOR y SOPORTE_INSITU', () => {
    // Inspecciona la metadata fijada por el decorador @Roles('ADMINISTRADOR', 'SOPORTE_INSITU') en el método addTicketsToCita
    const roles = reflector.get<string[]>(
      'roles',
      CitasController.prototype.addTicketsToCita,
    );

    expect(roles).toBeDefined();
    expect(roles).toEqual(
      expect.arrayContaining(['ADMINISTRADOR', 'SOPORTE_INSITU']),
    );
  });

  it('no debe permitir que roles de clientes o soporte técnico no asignado tengan permiso en el endpoint', () => {
    // Verifica explícitamente que los roles no autorizados no existan dentro de la metadata de roles
    const roles = reflector.get<string[]>(
      'roles',
      CitasController.prototype.addTicketsToCita,
    );

    expect(roles).not.toContain('CLIENTE_EMPRESA');
    expect(roles).not.toContain('CLIENTE_SUCURSAL');
    expect(roles).not.toContain('CLIENTE_TRABAJADOR');
    expect(roles).not.toContain('SOPORTE_TECNICO');
  });
});
