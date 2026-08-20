import { Test, TestingModule } from '@nestjs/testing';
import { ListUsersUseCase } from './list-users.use-case';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '@/entities/Usuario.entity';
import { UnauthorizedException } from '@nestjs/common';

describe('ListUsersUseCase', () => {
  let useCase: ListUsersUseCase;
  let usuarioRepo: Repository<Usuario>;
  let qbMock: any;

  beforeEach(async () => {
    qbMock = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getRawAndEntities: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListUsersUseCase,
        {
          provide: getRepositoryToken(Usuario),
          useValue: {
            createQueryBuilder: jest.fn(() => qbMock),
          },
        },
      ],
    }).compile();

    useCase = module.get<ListUsersUseCase>(ListUsersUseCase);
    usuarioRepo = module.get<Repository<Usuario>>(getRepositoryToken(Usuario));
  });

  it('debería estar definido', () => {
    expect(useCase).toBeDefined();
  });

  it('debería listar usuarios como admin', async () => {
    qbMock.getRawAndEntities.mockResolvedValue({
      entities: [{ id_usuario: 1, nombre: 'Juan', apellido: 'Pérez', rol: { id_rol: 1, nombre: 'ADMINISTRADOR' } }],
      raw: [{ cliente_nombre_principal: null, sucursal_nombre_sucursal: null }],
    });

    const result = await useCase.execute({ role: 'ADMINISTRADOR', clienteId: null, sucursalId: null }, {} as any);
    expect(result).toHaveLength(1);
    expect(result[0].id_usuario).toBe(1);
  });

  it('debería lanzar unauthorized para rol desconocido', async () => {
    qbMock.getRawAndEntities.mockResolvedValue({
      entities: [],
      raw: [],
    });

    await expect(useCase.execute({ role: 'ROL_DESCONOCIDO', clienteId: null, sucursalId: null }, {} as any)).rejects.toThrow(UnauthorizedException);
  });
});
