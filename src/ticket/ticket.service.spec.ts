import { Test, TestingModule } from '@nestjs/testing';
import { TicketService } from './ticket.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tickets, TicketStatus } from '@/entities/Tickets.entity';
import { Equipos } from '@/entities/Equipos.entity';
import { QueryFailedError } from 'typeorm';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';

describe('TicketService', () => {
  let service: TicketService;
  let ticketRepo: Repository<Tickets>;
  let equiposRepo: Repository<Equipos>;
  let qbMock: any;

  beforeEach(async () => {
    qbMock = {
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketService,
        {
          provide: getRepositoryToken(Tickets),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            createQueryBuilder: jest.fn(() => qbMock),
          },
        },
        {
          provide: getRepositoryToken(Equipos),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TicketService>(TicketService);
    ticketRepo = module.get<Repository<Tickets>>(getRepositoryToken(Tickets));
    equiposRepo = module.get<Repository<Equipos>>(getRepositoryToken(Equipos));
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  it('debería crear un ticket', async () => {
    const equipo = { id_equipo: 1, id_cliente: 1 };
    jest.spyOn(equiposRepo, 'findOne').mockResolvedValue(equipo as any);
    jest.spyOn(ticketRepo, 'create').mockReturnValue({} as any);
    jest.spyOn(ticketRepo, 'save').mockResolvedValue({ id_tickets: 1, pin: '123456' } as any);
    jest.spyOn(ticketRepo, 'findOne').mockResolvedValue(null as any);

    const dto = { asunto: 'No enciende', id_equipo: 1, es_software: false, detalle: 'Detalle', id_software: undefined, imagen_url: undefined };
    const user = { role: 'CLIENTE_TRABAJADOR', clienteId: 1, userId: 1 };
    const result = await service.createTicket(dto as any, user as any);
    expect(result).toHaveProperty('message');
    expect(result).toHaveProperty('ticket');
  });

  it('debería fallar si el equipo no pertenece a la empresa del usuario', async () => {
    const equipo = { id_equipo: 1, id_cliente: 2 };
    jest.spyOn(equiposRepo, 'findOne').mockResolvedValue(equipo as any);

    const dto = { asunto: 'No enciende', id_equipo: 1, es_software: false, detalle: 'Detalle', id_software: undefined, imagen_url: undefined };
    const user = { role: 'CLIENTE_TRABAJADOR', clienteId: 1, userId: 1 };
    await expect(service.createTicket(dto as any, user as any)).rejects.toThrow(ForbiddenException);
  });

  it('debería fallar si el equipo no existe', async () => {
    jest.spyOn(equiposRepo, 'findOne').mockResolvedValue(null as any);

    const dto = { asunto: 'No enciende', id_equipo: 999, es_software: false, detalle: 'Detalle', id_software: undefined, imagen_url: undefined };
    const user = { role: 'CLIENTE_TRABAJADOR', clienteId: 1, userId: 1 };
    await expect(service.createTicket(dto as any, user as any)).rejects.toThrow(NotFoundException);
  });

  it('debería obtener ticket por id para admin', async () => {
    const ticket = { id_ticket: 1, id_cliente: 1, id_soporte: null, estado: TicketStatus.PENDIENTE, trabajador: null, soporte: null, equipo: null };
    jest.spyOn(ticketRepo, 'findOne').mockResolvedValue(ticket as any);

    const user = { role: 'ADMINISTRADOR', clienteId: null, userId: 1, sucursalId: null };
    const result = await service.getTicketById(1, user as any);
    expect(result).toHaveProperty('id_ticket');
  });

  it('debería fallar si el ticket no existe', async () => {
    jest.spyOn(ticketRepo, 'findOne').mockResolvedValue(null as any);

    const user = { role: 'ADMINISTRADOR', clienteId: null, userId: 1, sucursalId: null };
    await expect(service.getTicketById(999, user as any)).rejects.toThrow(NotFoundException);
  });

  it('debería asignar ticket', async () => {
    const ticket = { id_ticket: 1, estado: TicketStatus.PENDIENTE };
    jest.spyOn(ticketRepo, 'findOne').mockResolvedValue(ticket as any);
    qbMock.execute.mockResolvedValue({ affected: 1 } as any);

    const user = { role: 'ADMINISTRADOR', clienteId: null, userId: 1 };
    const result = await service.assignTicket(1, 2, user as any);
    expect(result).toBeDefined();
  });

  it('debería fallar al asignar ticket si no está pendiente', async () => {
    const ticket = { id_ticket: 1, estado: TicketStatus.CERRADO };
    jest.spyOn(ticketRepo, 'findOne').mockResolvedValue(ticket as any);
    qbMock.execute.mockResolvedValue({ affected: 0 } as any);

    const user = { role: 'ADMINISTRADOR', clienteId: null, userId: 1 };
    await expect(service.assignTicket(1, 2, user as any)).rejects.toThrow(BadRequestException);
  });
});
