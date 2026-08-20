import { Test, TestingModule } from '@nestjs/testing';
import { FindAllClientesUseCase } from './find-all-clientes.use-case';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Clientes } from '@/entities/Clientes.entity';
import { ClienteResponseHelper } from '../helpers/cliente-response.helper';

describe('FindAllClientesUseCase', () => {
  let useCase: FindAllClientesUseCase;
  let clientesRepo: Repository<Clientes>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllClientesUseCase,
        {
          provide: getRepositoryToken(Clientes),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: ClienteResponseHelper,
          useValue: {
            cleanResponse: jest.fn((cliente) => cliente),
          },
        },
      ],
    }).compile();

    useCase = module.get<FindAllClientesUseCase>(FindAllClientesUseCase);
    clientesRepo = module.get<Repository<Clientes>>(getRepositoryToken(Clientes));
  });

  it('debería estar definido', () => {
    expect(useCase).toBeDefined();
  });

  it('debería retornar todos los clientes', async () => {
    jest.spyOn(clientesRepo, 'find').mockResolvedValue([{ id_cliente: 1 }] as any);

    const result = await useCase.execute();
    expect(result).toHaveLength(1);
  });
});
