import { Test, TestingModule } from '@nestjs/testing';
import { DashboardsService } from './dashboards.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tickets, TicketStatus } from '@/entities/Tickets.entity';
import { Usuario } from '@/entities/Usuario.entity';
import { Equipos } from '@/entities/Equipos.entity';

describe('DashboardsService', () => {
  let service: DashboardsService;
  let ticketRepo: Repository<Tickets>;
  let usuarioRepo: Repository<Usuario>;
  let equipoRepo: Repository<Equipos>;
  let ticketQbMock: any;
  let usuarioQbMock: any;
  let equipoQbMock: any;

  beforeEach(async () => {
    ticketQbMock = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
      getRawMany: jest.fn(),
      innerJoin: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      addGroupBy: jest.fn().mockReturnThis(),
      setParameter: jest.fn().mockReturnThis(),
      getRawAndEntities: jest.fn(),
      getCount: jest.fn().mockResolvedValue(0),
      clone: jest.fn().mockReturnThis(),
    };

    usuarioQbMock = {
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      addGroupBy: jest.fn().mockReturnThis(),
      setParameter: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([]),
    };

    equipoQbMock = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardsService,
        {
          provide: getRepositoryToken(Tickets),
          useValue: {
            count: jest.fn().mockResolvedValue(10),
            createQueryBuilder: jest.fn(() => ticketQbMock),
          },
        },
        {
          provide: getRepositoryToken(Usuario),
          useValue: {
            createQueryBuilder: jest.fn(() => usuarioQbMock),
          },
        },
        {
          provide: getRepositoryToken(Equipos),
          useValue: {
            createQueryBuilder: jest.fn(() => equipoQbMock),
          },
        },
      ],
    }).compile();

    service = module.get<DashboardsService>(DashboardsService);
    ticketRepo = module.get<Repository<Tickets>>(getRepositoryToken(Tickets));
    usuarioRepo = module.get<Repository<Usuario>>(getRepositoryToken(Usuario));
    equipoRepo = module.get<Repository<Equipos>>(getRepositoryToken(Equipos));
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  it('debería obtener dashboard de admin', async () => {
    ticketQbMock.getCount.mockResolvedValue(10);
    ticketQbMock.getRawMany.mockResolvedValue([]);
    equipoQbMock.getMany.mockResolvedValue([]);
    usuarioQbMock.getRawMany.mockResolvedValue([]);

    const result = await service.getAdminDashboard();
    expect(result).toHaveProperty('resumen');
    expect(result).toHaveProperty('cronograma');
    expect(result).toHaveProperty('desempeno');
    expect(result.resumen.totalTickets).toBe(10);
  });
});
