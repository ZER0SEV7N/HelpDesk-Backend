import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '@/entities/Usuario.entity';
import { Rol } from '@/entities/Rol.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '@/common/email/email.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let usuariosRepo: Repository<Usuario>;
  let rolRepo: Repository<Rol>;
  let jwtService: JwtService;
  let configService: ConfigService;
  let emailService: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(Usuario),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Rol),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendPasswordRecovery: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usuariosRepo = module.get<Repository<Usuario>>(getRepositoryToken(Usuario));
    rolRepo = module.get<Repository<Rol>>(getRepositoryToken(Rol));
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
    emailService = module.get<EmailService>(EmailService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  it('debería registrar un usuario nuevo', async () => {
    const dto = { correo: 'test@example.com', password: 'password123', nombre: 'Juan', apellido: 'Pérez', telefono: '123456789' };
    jest.spyOn(usuariosRepo, 'findOne').mockResolvedValue(null as any);
    jest.spyOn(rolRepo, 'findOne').mockResolvedValue({ id_rol: 1, nombre: 'CLIENTE_TRABAJADOR' } as any);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
    jest.spyOn(usuariosRepo, 'create').mockReturnValue({} as any);
    jest.spyOn(usuariosRepo, 'save').mockResolvedValue({ id_usuario: 1 } as any);

    const result = await service.register(dto as any);
    expect(result).toEqual({ message: 'Usuario registrado exitosamente' });
  });

  it('debería lanzar conflicto si el correo ya existe', async () => {
    jest.spyOn(usuariosRepo, 'findOne').mockResolvedValue({ id_usuario: 1 } as any);
    await expect(service.register({ correo: 'test@example.com', password: 'password123' } as any)).rejects.toThrow(HttpException);
  });

  it('debería hacer login correctamente', async () => {
    const user = { id_usuario: 1, correo: 'test@example.com', password: 'hashed', is_active: true, rol: { nombre: 'CLIENTE_TRABAJADOR' } };
    jest.spyOn(usuariosRepo, 'findOne').mockResolvedValue(user as any);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwtService.sign as jest.Mock).mockReturnValue('token');

    const result = await service.login({ correo: 'test@example.com', password: 'password123' } as any);
    expect(result.token).toBe('token');
    expect(result.role).toBe('CLIENTE_TRABAJADOR');
  });

  it('debería lanzar unauthorized si contraseña incorrecta', async () => {
    const user = { id_usuario: 1, correo: 'test@example.com', password: 'hashed', is_active: true, rol: { nombre: 'CLIENTE_TRABAJADOR' } };
    jest.spyOn(usuariosRepo, 'findOne').mockResolvedValue(user as any);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(service.login({ correo: 'test@example.com', password: 'wrong' } as any)).rejects.toThrow(UnauthorizedException);
  });

  it('debería recuperar contraseña si el usuario existe', async () => {
    const user = { id_usuario: 1, correo: 'test@example.com' };
    jest.spyOn(usuariosRepo, 'findOne').mockResolvedValue(user as any);
    (jwtService.sign as jest.Mock).mockReturnValue('reset-token');
    (emailService.sendPasswordRecovery as jest.Mock).mockResolvedValue(undefined);

    const result = await service.recoverPassword('test@example.com');
    expect(result.message).toContain('Si el correo está registrado');
  });

  it('debería retornar mensaje genérico si el usuario no existe en recoverPassword', async () => {
    jest.spyOn(usuariosRepo, 'findOne').mockResolvedValue(null as any);
    const result = await service.recoverPassword('no@example.com');
    expect(result.message).toContain('Si el correo está registrado');
  });

  it('debería resetear contraseña con token válido', async () => {
    (jwtService.verifyAsync as jest.Mock).mockResolvedValue({ sub: 1 } as any);
    (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed');
    jest.spyOn(usuariosRepo, 'update').mockResolvedValue({ affected: 1 } as any);

    const result = await service.resetPassword('valid-token', 'newpassword');
    expect(result.message).toBe('Contraseña restablecida exitosamente');
  });

  it('debería lanzar error con token inválido', async () => {
    (jwtService.verifyAsync as jest.Mock).mockRejectedValue(new Error('invalid'));
    await expect(service.resetPassword('invalid-token', 'newpassword')).rejects.toThrow(HttpException);
  });

  it('debería verificar token correctamente', async () => {
    (jwtService.verifyAsync as jest.Mock).mockResolvedValue({ sub: 1 } as any);
    const result = await service.verifyToken('valid-token');
    expect(result).toEqual({ sub: 1 });
  });

  it('debería retornar false si usuario no existe en isUserActive', async () => {
    jest.spyOn(usuariosRepo, 'findOne').mockResolvedValue(null as any);
    expect(await service.isUserActive(999)).toBe(false);
  });

  it('debería retornar estado de usuario en isUserActive', async () => {
    jest.spyOn(usuariosRepo, 'findOne').mockResolvedValue({ id_usuario: 1, is_active: true } as any);
    expect(await service.isUserActive(1)).toBe(true);
  });
});
