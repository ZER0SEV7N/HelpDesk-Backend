import { Test, TestingModule } from '@nestjs/testing';
import { DeactivateClienteUseCase } from './deactivate-cliente.use-case';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Clientes } from '@/entities/Clientes.entity';
import { Sucursales } from '@/entities/Sucursales.entity';
import { Area } from '@/entities/Area.entity';
import { Usuario } from '@/entities/Usuario.entity';
import { Equipos } from '@/entities/Equipos.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('DeactivateClienteUseCase', () => {
  let useCase: DeactivateClienteUseCase;
  let clientesRepo: Repository<Clientes>;
  let sucursalesRepo: Repository<Sucursales>;
  let areaRepo: Repository<Area>;
  let usuariosRepo: Repository<Usuario>;
  let equiposRepo: Repository<Equipos>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeactivateClienteUseCase,
        {
          provide: getRepositoryToken(Clientes),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Sucursales),
          useValue: {
            find: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Area),
          useValue: {
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Usuario),
          useValue: {
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Equipos),
          useValue: {
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<DeactivateClienteUseCase>(DeactivateClienteUseCase);
    clientesRepo = module.get<Repository<Clientes>>(getRepositoryToken(Clientes));
    sucursalesRepo = module.get<Repository<Sucursales>>(getRepositoryToken(Sucursales));
    areaRepo = module.get<Repository<Area>>(getRepositoryToken(Area));
    usuariosRepo = module.get<Repository<Usuario>>(getRepositoryToken(Usuario));
    equiposRepo = module.get<Repository<Equipos>>(getRepositoryToken(Equipos));
  });

  it('debería estar definido', () => {
    expect(useCase).toBeDefined();
  });

  it('debería desactivar cliente', async () => {
    jest.spyOn(clientesRepo, 'findOne').mockResolvedValue({ id_cliente: 1, nombre_principal: 'Empresa', is_active: true } as any);
    jest.spyOn(clientesRepo, 'save').mockResolvedValue({} as any);
    jest.spyOn(sucursalesRepo, 'find').mockResolvedValue([{ id_sucursal: 1 }] as any);
    jest.spyOn(sucursalesRepo, 'update').mockResolvedValue({ affected: 1 } as any);
    jest.spyOn(areaRepo, 'update').mockResolvedValue({ affected: 1 } as any);
    jest.spyOn(usuariosRepo, 'update').mockResolvedValue({ affected: 1 } as any);
    jest.spyOn(equiposRepo, 'update').mockResolvedValue({ affected: 1 } as any);

    const result = await useCase.execute(1);
    expect(result.message).toContain('desactivados');
  });

  it('debería fallar si cliente no existe', async () => {
    jest.spyOn(clientesRepo, 'findOne').mockResolvedValue(null as any);
    await expect(useCase.execute(999)).rejects.toThrow(NotFoundException);
  });

  it('debería fallar si cliente ya está inactivo', async () => {
    jest.spyOn(clientesRepo, 'findOne').mockResolvedValue({ id_cliente: 1, is_active: false } as any);
    await expect(useCase.execute(1)).rejects.toThrow(BadRequestException);
  });
});
