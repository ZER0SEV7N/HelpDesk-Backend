import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import {
  INestApplication,
  ValidationPipe,
  BadRequestException,
  NotFoundException,
  ConflictException,
  Global,
  Module,
} from '@nestjs/common';
import request from 'supertest';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { getRepositoryToken } from '@nestjs/typeorm';

import { AuthModule } from '../src/modules/auth/auth.module';
import { UsuarioModule } from '../src/modules/usuario/usuario.module';
import { EmailService } from '../src/common/email/email.service';
import { EmployeeRegistrationManager } from '../src/modules/usuario/managers/employee-registration.manager';
import { NotificationGateway } from '../src/common/websockets/notification.gateway';
import { ListUsersUseCase } from '../src/modules/usuario/application/list-users.use-case';
import { Rol } from '../src/entities/Rol.entity';
import { Usuario } from '../src/entities/Usuario.entity';
import { Clientes } from '../src/entities/Clientes.entity';
import { Sucursales } from '../src/entities/Sucursales.entity';
import { JwtPayload } from '../src/common/guards/jwt-auth.guard';

interface InMemoryUser {
  id_usuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  password: string;
  telefono: string;
  is_active: boolean;
  id_rol: number;
  id_cliente?: number;
  id_sucursal?: number;
  created_at: Date;
  updated_at: Date;
  rol?: Rol;
  cliente?: any;
  sucursal?: any;
}

const db: {
  usuarios: Map<number, InMemoryUser>;
  roles: Map<number, Rol>;
  clientes: Map<number, any>;
  sucursales: Map<number, any>;
  nextUsuarioId: number;
  nextRolId: number;
  nextClienteId: number;
  nextSucursalId: number;
} = {
  usuarios: new Map(),
  roles: new Map(),
  clientes: new Map(),
  sucursales: new Map(),
  nextUsuarioId: 1,
  nextRolId: 1,
  nextClienteId: 1,
  nextSucursalId: 1,
};

const pendingVerifications: Map<string, { dto: any; token: string }> =
  new Map();

function attachRelations(user: InMemoryUser, relations: string[]): any {
  const result: any = { ...user };
  for (const rel of relations) {
    if (rel === 'rol') result.rol = db.roles.get(user.id_rol);
    if (rel === 'cliente')
      result.cliente = db.clientes.get(user.id_cliente);
    if (rel === 'sucursal')
      result.sucursal = db.sucursales.get(user.id_sucursal);
  }
  return result;
}

const mockRolRepo = {
  findOne: jest.fn(async (options: any) => {
    const { where } = options || {};
    for (const rol of db.roles.values()) {
      if (where.nombre && rol.nombre === where.nombre) return rol;
      if (where.id_rol && rol.id_rol === where.id_rol) return rol;
    }
    return null;
  }),
  save: jest.fn(async (entity: any) => {
    if (!entity.id_rol) entity.id_rol = db.nextRolId++;
    db.roles.set(entity.id_rol, entity);
    return entity;
  }),
};

const mockClienteRepo = {
  findOne: jest.fn(async (options: any) => {
    const { where } = options || {};
    if (where.id_cliente) return db.clientes.get(where.id_cliente) || null;
    return null;
  }),
  save: jest.fn(async (entity: any) => {
    if (!entity.id_cliente) entity.id_cliente = db.nextClienteId++;
    db.clientes.set(entity.id_cliente, entity);
    return entity;
  }),
};

const mockSucursalRepo = {
  findOne: jest.fn(async (options: any) => {
    const { where } = options || {};
    if (where.id_sucursal)
      return db.sucursales.get(where.id_sucursal) || null;
    return null;
  }),
  save: jest.fn(async (entity: any) => {
    if (!entity.id_sucursal) entity.id_sucursal = db.nextSucursalId++;
    db.sucursales.set(entity.id_sucursal, entity);
    return entity;
  }),
};

const mockUsuarioRepo = {
  findOne: jest.fn(async (options: any) => {
    const { where, relations } = options || {};
    for (const user of db.usuarios.values()) {
      let match = false;
      if (where.id_usuario && user.id_usuario === where.id_usuario)
        match = true;
      if (where.correo && user.correo === where.correo) match = true;
      if (match) {
        return relations ? attachRelations(user, relations) : user;
      }
    }
    return null;
  }),
  save: jest.fn(async (entity: any) => {
    if (Array.isArray(entity)) {
      return Promise.all(entity.map((e) => mockUsuarioRepo.save(e)));
    }
    if (!entity.id_usuario) {
      entity.id_usuario = db.nextUsuarioId++;
    }
    if (entity.rol && typeof entity.rol === 'object' && entity.rol.id_rol) {
      entity.id_rol = entity.rol.id_rol;
    }
    db.usuarios.set(entity.id_usuario, entity);
    return entity;
  }),
  create: jest.fn((entity: any) => entity),
  update: jest.fn(async (criteria: any, partialEntity: any) => {
    for (const [id, user] of db.usuarios.entries()) {
      if (
        (typeof criteria === 'number' && user.id_usuario === criteria) ||
        (criteria.id_usuario && user.id_usuario === criteria.id_usuario)
      ) {
        Object.assign(user, partialEntity);
        db.usuarios.set(id, user);
        return { affected: 1 };
      }
    }
    return { affected: 0 };
  }),
  createQueryBuilder: jest.fn(() => ({
    leftJoinAndSelect: jest.fn().returnThis(),
    leftJoin: jest.fn().returnThis(),
    select: jest.fn().returnThis(),
    andWhere: jest.fn().returnThis(),
    getRawAndEntities: jest.fn().mockImplementation(async () => {
      const entities = Array.from(db.usuarios.values()).map((u) =>
        attachRelations(u, ['rol']),
      );
      const raw = Array.from(db.usuarios.values()).map((u) => {
        const rol = db.roles.get(u.id_rol);
        return {
          user_id_usuario: u.id_usuario,
          user_nombre: u.nombre,
          user_apellido: u.apellido,
          user_correo: u.correo,
          user_telefono: u.telefono,
          user_is_active: u.is_active,
          user_created_at: u.created_at,
          rol_id_rol: rol?.id_rol,
          rol_nombre: rol?.nombre,
          cliente_nombre_principal: null,
          sucursal_nombre_sucursal: null,
        };
      });
      return { entities, raw };
    }),
  })),
};

const mockEmployeeRegistrationManager = {
  initiateVerification: jest.fn(async (dto: any, userPayload: JwtPayload) => {
    const token = crypto.randomBytes(32).toString('hex');
    pendingVerifications.set(dto.correo, { dto, token });
    return {
      message:
        'Código de verificación enviado al correo del empleado. Esperando confirmación en tiempo real.',
      expiraEn: '15 minutos',
    };
  }),
  confirmEmail: jest.fn(async (correo: string, token: string) => {
    const session = pendingVerifications.get(correo);
    if (!session)
      throw new BadRequestException(
        'El proceso de verificación no existe o ha expirado.',
      );
    if (session.token !== token)
      throw new BadRequestException(
        'El token de verificación proporcionado es inválido.',
      );
    pendingVerifications.delete(correo);
    return session.dto;
  }),
  updatePendingData: jest.fn(),
  cancelVerification: jest.fn(),
};

const mockEmailService = {
  sendEmployeeVerification: jest.fn().mockResolvedValue(undefined),
  sendPasswordRecovery: jest.fn().mockResolvedValue(undefined),
};

const mockNotificationGateway = {
  emitEmailVerificationStatus: jest.fn(),
};

const mockListUsersUseCase = {
  execute: jest.fn(async (userPayload: any, filters: any) => {
    const allowedRoles = [
      'ADMINISTRADOR',
      'SOPORTE_TECNICO',
      'SOPORTE_INSITU',
      'CLIENTE_EMPRESA',
    ];
    return Array.from(db.usuarios.values())
      .filter((u) => {
        const rol = db.roles.get(u.id_rol);
        return rol && allowedRoles.includes(rol.nombre);
      })
      .map((u) => {
        const rol = db.roles.get(u.id_rol);
        return {
          id_usuario: u.id_usuario,
          nombre: u.nombre,
          apellido: u.apellido,
          correo: u.correo,
          telefono: u.telefono,
          is_active: u.is_active,
          rol: { id_rol: rol?.id_rol, nombre: rol?.nombre },
          empresa_nombre: null,
          sucursal_nombre: null,
          created_at: u.created_at,
        };
      });
  }),
};

@Global()
@Module({
  providers: [{ provide: EmailService, useValue: mockEmailService }],
  exports: [EmailService],
})
class TestEmailModule {}

describe('Usuario Creation Flow (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;

  beforeAll(async () => {
    db.usuarios.clear();
    db.roles.clear();
    db.clientes.clear();
    db.sucursales.clear();
    db.nextUsuarioId = 1;
    db.nextRolId = 1;
    db.nextClienteId = 1;
    db.nextSucursalId = 1;
    pendingVerifications.clear();

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TestEmailModule,
        AuthModule,
        UsuarioModule,
      ],
    })
      .overrideProvider(getRepositoryToken(Usuario))
      .useValue(mockUsuarioRepo)
      .overrideProvider(getRepositoryToken(Rol))
      .useValue(mockRolRepo)
      .overrideProvider(getRepositoryToken(Clientes))
      .useValue(mockClienteRepo)
      .overrideProvider(getRepositoryToken(Sucursales))
      .useValue(mockSucursalRepo)
      .overrideProvider(EmployeeRegistrationManager)
      .useValue(mockEmployeeRegistrationManager)
      .overrideProvider(NotificationGateway)
      .useValue(mockNotificationGateway)
      .overrideProvider(ListUsersUseCase)
      .useValue(mockListUsersUseCase)
      .compile({ timeout: 30000 });

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    const nombresRoles = [
      'ADMINISTRADOR',
      'SOPORTE_TECNICO',
      'SOPORTE_INSITU',
      'CLIENTE_EMPRESA',
      'CLIENTE_SUCURSAL',
      'CLIENTE_TRABAJADOR',
    ];
    for (const nombre of nombresRoles) {
      await mockRolRepo.save({ nombre } as Rol);
    }

    await mockClienteRepo.save({
      id_cliente: 1,
      tipo_cliente: 'JURIDICA',
      numero_documento: '20555666777',
      nombre_principal: 'Innovación Global Tech',
      direccion: 'Av. Principal 123',
      telefono: '987654321',
      correo: 'admin@innovaciontech.com',
      rubro: 'Tecnología',
      id_plan: null,
      fecha_inicio_plan: new Date('2026-01-01'),
      fecha_finalizacion_plan: new Date('2027-01-01'),
      costo_negociado: 399.99,
      limite_equipos_contratado: 500,
      is_active: true,
    } as Clientes);

    await mockSucursalRepo.save({
      id_sucursal: 1,
      nombre_sucursal: 'Sede Central',
      encargado: 'Carlos Mendoza',
      telefono: '01-444-5555',
      direccion: 'Av. Principal 123',
      correo: 'sede.central@innovaciontech.com',
      id_cliente: 1,
      is_active: true,
    } as Sucursales);

    const adminRol = await mockRolRepo.findOne({
      where: { nombre: 'ADMINISTRADOR' },
    });
    await mockUsuarioRepo.save({
      id_usuario: 1,
      nombre: 'Daniel',
      apellido: 'Singer',
      correo: 'admin@zaint.com',
      password: await bcrypt.hash('123456', 10),
      telefono: '987654321',
      is_active: true,
      id_rol: adminRol.id_rol,
      rol: adminRol,
    } as InMemoryUser);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Login as administrator', () => {
    it('should login as admin and receive JWT token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          correo: 'admin@zaint.com',
          password: '123456',
        })
        .expect(200);

      expect(res.body.token).toBeDefined();
      expect(res.body.user.role).toBe('ADMINISTRADOR');
      adminToken = res.body.token;
    });
  });

  describe('Create users with different roles', () => {
    const rolesToTest = [
      { rolNombre: 'CLIENTE_TRABAJADOR', suffix: 'worker' },
      { rolNombre: 'SOPORTE_TECNICO', suffix: 'tech' },
      { rolNombre: 'SOPORTE_INSITU', suffix: 'insitu' },
      { rolNombre: 'CLIENTE_EMPRESA', suffix: 'empresa' },
      { rolNombre: 'CLIENTE_SUCURSAL', suffix: 'sucursal' },
    ];

    rolesToTest.forEach(({ rolNombre, suffix }) => {
      it(`should create user with role ${rolNombre}`, async () => {
        const correo = `test.${suffix}@test.com`;

        const registerRes = await request(app.getHttpServer())
          .post('/usuario/registrar-empleado')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            nombre: 'Test',
            apellido: suffix.charAt(0).toUpperCase() + suffix.slice(1),
            correo,
            password: 'password123',
            telefono: '123456789',
            rolNombre,
            id_cliente: 1,
            id_sucursal: 1,
          })
          .expect(201);

        expect(registerRes.body.message).toContain('verificación');

        const session = pendingVerifications.get(correo);
        expect(session).toBeDefined();

        const confirmRes = await request(app.getHttpServer())
          .get('/usuario/confirmar-correo')
          .query({ correo, token: session.token })
          .expect(200);

        expect(confirmRes.body.message).toContain('verificado');
        expect(confirmRes.body.user).toBeDefined();
        expect(confirmRes.body.user.rol.nombre).toBe(rolNombre);
        expect(confirmRes.body.user.nombre).toBe('Test');
        expect(confirmRes.body.user.correo).toBe(correo);
      });
    });

    it('should reject creation without authentication', async () => {
      await request(app.getHttpServer())
        .post('/usuario/registrar-empleado')
        .send({
          nombre: 'NoAuth',
          apellido: 'User',
          correo: 'noauth@test.com',
          password: 'password123',
          telefono: '123456789',
          rolNombre: 'CLIENTE_TRABAJADOR',
        })
        .expect(401);
    });
  });

  describe('Assign role to user', () => {
    it('should change a user role from CLIENTE_TRABAJADOR to SOPORTE_TECNICO', async () => {
      const correo = 'test.worker@test.com';

      const user = await mockUsuarioRepo.findOne({
        where: { correo },
        relations: ['rol'],
      });
      expect(user).toBeDefined();
      expect(user.rol.nombre).toBe('CLIENTE_TRABAJADOR');

      const res = await request(app.getHttpServer())
        .patch(`/usuario/${user.id_usuario}/rol`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ rolNombre: 'SOPORTE_TECNICO' })
        .expect(200);

      expect(res.body.message).toContain('SOPORTE_TECNICO');

      const updatedUser = await mockUsuarioRepo.findOne({
        where: { id_usuario: user.id_usuario },
        relations: ['rol'],
      });
      expect(updatedUser.rol.nombre).toBe('SOPORTE_TECNICO');
    });
  });

  describe('List users', () => {
    it('should list all users visible to admin', async () => {
      const res = await request(app.getHttpServer())
        .get('/usuario/list')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBeGreaterThanOrEqual(4);

      const rolesEncontrados = res.body.map((u: any) => u.rol.nombre);
      expect(rolesEncontrados).toContain('ADMINISTRADOR');
      expect(rolesEncontrados).toContain('SOPORTE_TECNICO');
      expect(rolesEncontrados).toContain('SOPORTE_INSITU');
      expect(rolesEncontrados).toContain('CLIENTE_EMPRESA');
    });
  });
});
