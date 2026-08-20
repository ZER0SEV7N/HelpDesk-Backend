import { RegisterEmployeeUseCase } from './register-employee.use-case';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '@/entities/Usuario.entity';
import { Rol } from '@/entities/Rol.entity';
import { Clientes } from '@/entities/Clientes.entity';
import { Sucursales } from '@/entities/Sucursales.entity';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';

describe('RegisterEmployeeUseCase', () => {
  let useCase: RegisterEmployeeUseCase;

  beforeEach(() => {
    const usuarioRepo = {
      findOne: jest.fn(),
    } as unknown as Repository<Usuario>;

    const rolRepo = {
      findOne: jest.fn(),
    } as unknown as Repository<Rol>;

    const clientesRepo = {
      findOne: jest.fn(),
    } as unknown as Repository<Clientes>;

    const sucursalRepo = {
      findOne: jest.fn(),
    } as unknown as Repository<Sucursales>;

    useCase = new RegisterEmployeeUseCase(
      usuarioRepo,
      rolRepo,
      clientesRepo,
      sucursalRepo,
      {
        initiateVerification: jest.fn(),
      } as any,
    );
  });

  it('debería estar definido', () => {
    expect(useCase).toBeDefined();
  });

  it('debería registrar empleado', async () => {
    (useCase as any).usuarioRepo.findOne.mockResolvedValue(null as any);
    (useCase as any).rolRepo.findOne.mockResolvedValue({ id_rol: 2, nombre: 'CLIENTE_TRABAJADOR' } as any);
    (useCase as any).clientesRepo.findOne.mockResolvedValue({ id_cliente: 1 } as any);
    (useCase as any).sucursalRepo.findOne.mockResolvedValue(null as any);
    (useCase as any).registrationManager.initiateVerification.mockResolvedValue({ message: 'Verificación iniciada' });

    const dto = { nombre: 'Juan', apellido: 'Pérez', correo: 'juan@example.com', password: 'password123', telefono: '123456789', rolNombre: 'CLIENTE_TRABAJADOR' } as any;
    const result = await useCase.execute(dto, { role: 'ADMINISTRADOR', clienteId: null });
    expect(result).toHaveProperty('message');
  });

  it('debería lanzar conflicto si el correo ya existe', async () => {
    (useCase as any).usuarioRepo.findOne.mockResolvedValue({ id_usuario: 1 } as any);
    await expect(useCase.execute({ correo: 'juan@example.com', rolNombre: 'CLIENTE_TRABAJADOR' } as any, { role: 'ADMINISTRADOR', clienteId: null })).rejects.toThrow(ConflictException);
  });

  it('debería lanzar not found si el rol no existe', async () => {
    (useCase as any).usuarioRepo.findOne.mockResolvedValue(null as any);
    (useCase as any).rolRepo.findOne.mockResolvedValue(null as any);
    await expect(useCase.execute({ correo: 'juan@example.com', rolNombre: 'INEXISTENTE' } as any, { role: 'ADMINISTRADOR', clienteId: null })).rejects.toThrow(NotFoundException);
  });
});
