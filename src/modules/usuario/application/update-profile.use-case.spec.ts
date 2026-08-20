import { Test, TestingModule } from '@nestjs/testing';
import { UpdateProfileUseCase } from './update-profile.use-case';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '@/entities/Usuario.entity';
import { UsuarioValidationService } from './common/usuario-validation.service';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('UpdateProfileUseCase', () => {
  let useCase: UpdateProfileUseCase;
  let usuarioRepo: Repository<Usuario>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateProfileUseCase,
        {
          provide: getRepositoryToken(Usuario),
          useValue: {
            save: jest.fn(),
          },
        },
        {
          provide: UsuarioValidationService,
          useValue: {
            validateUserExists: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<UpdateProfileUseCase>(UpdateProfileUseCase);
    usuarioRepo = module.get<Repository<Usuario>>(getRepositoryToken(Usuario));
  });

  it('debería estar definido', () => {
    expect(useCase).toBeDefined();
  });

  it('debería actualizar perfil', async () => {
    const user = { id_usuario: 1, password: 'hashed', nombre: 'Juan', apellido: 'Pérez', telefono: '123' };
    (useCase as any).validationService.validateUserExists.mockResolvedValue(user);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed');
    jest.spyOn(usuarioRepo, 'save').mockResolvedValue({} as any);

    const dto = { currentPassword: 'oldpass', nombre: 'Juan' } as any;
    const result = await useCase.execute(1, dto);
    expect(result.message).toContain('actualizado');
  });

  it('debería fallar si contraseña actual es incorrecta', async () => {
    const user = { id_usuario: 1, password: 'hashed' };
    (useCase as any).validationService.validateUserExists.mockResolvedValue(user);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(useCase.execute(1, { currentPassword: 'wrong' } as any)).rejects.toThrow(UnauthorizedException);
  });
});
