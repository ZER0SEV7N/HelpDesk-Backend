import { Test, TestingModule } from '@nestjs/testing';
import { CreateEquipoUseCase } from './create-equipo.use-case';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Equipos } from '@/entities/Equipos.entity';

describe('CreateEquipoUseCase', () => {
  let useCase: CreateEquipoUseCase;
  let equiposRepo: Repository<Equipos>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateEquipoUseCase,
        {
          provide: getRepositoryToken(Equipos),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<CreateEquipoUseCase>(CreateEquipoUseCase);
    equiposRepo = module.get<Repository<Equipos>>(getRepositoryToken(Equipos));
  });

  it('debería estar definido', () => {
    expect(useCase).toBeDefined();
  });

  it('debería crear un equipo', async () => {
    jest.spyOn(equiposRepo, 'create').mockReturnValue({} as any);
    jest.spyOn(equiposRepo, 'save').mockResolvedValue({ id_equipo: 1 } as any);

    const result = await useCase.execute({ tipo: 'Laptop', marca: 'Dell', numero_serie: 'SN123', id_cliente: 1 } as any);
    expect(result).toHaveProperty('id_equipo');
  });
});
