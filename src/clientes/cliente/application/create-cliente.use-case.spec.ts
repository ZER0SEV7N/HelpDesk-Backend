import { CreateClienteUseCase } from './create-cliente.use-case';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Clientes } from '@/entities/Clientes.entity';
import { Planes } from '@/entities/Planes.entity';
import { Sucursales } from '@/entities/Sucursales.entity';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';

describe('CreateClienteUseCase', () => {
  let useCase: CreateClienteUseCase;

  beforeEach(() => {
    const clientesRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    } as unknown as Repository<Clientes>;

    const planesRepo = {
      findOne: jest.fn(),
    } as unknown as Repository<Planes>;

    const sucursalesRepo = {
      create: jest.fn(),
      save: jest.fn(),
    } as unknown as Repository<Sucursales>;

    useCase = new CreateClienteUseCase(
      clientesRepo,
      planesRepo,
      sucursalesRepo,
      { execute: jest.fn() } as any,
    );
  });

  it('debería estar definido', () => {
    expect(useCase).toBeDefined();
  });

  it('debería crear un cliente correctamente', async () => {
    const plan = { id_plan: 1, precio: 100, limite_equipos: 10 };
    (useCase as any).clientesRepo.findOne.mockResolvedValue(null as any);
    (useCase as any).planesRepo.findOne.mockResolvedValue(plan as any);
    (useCase as any).clientesRepo.create.mockReturnValue({} as any);
    (useCase as any).clientesRepo.save.mockResolvedValue({ id_cliente: 1, nombre_principal: 'Empresa' } as any);
    (useCase as any).sucursalesRepo.create.mockReturnValue({} as any);
    (useCase as any).sucursalesRepo.save.mockResolvedValue({} as any);
    (useCase as any).findOneClienteUseCase.execute.mockResolvedValue({ id_cliente: 1, nombre_principal: 'Empresa' });

    const dto = { tipo_cliente: 'JURIDICA', numero_documento: '123', nombre_principal: 'Empresa', direccion: 'Calle 1', telefono: '123', correo: 'test@example.com', fecha_inicio_plan: '2024-01-01', fecha_finalizacion_plan: '2025-01-01' } as any;
    const suc = { nombre_sucursal: 'Centro' } as any;
    const result = await useCase.execute(dto, suc);
    expect(result).toHaveProperty('id_cliente');
  });

  it('debería lanzar conflicto si el documento ya existe', async () => {
    (useCase as any).clientesRepo.findOne.mockResolvedValue({ id_cliente: 1 } as any);

    await expect(useCase.execute({ numero_documento: '123' } as any, {} as any)).rejects.toThrow(ConflictException);
  });

  it('debería lanzar not found si el plan no existe', async () => {
    (useCase as any).clientesRepo.findOne.mockResolvedValue(null as any);
    (useCase as any).planesRepo.findOne.mockResolvedValue(null as any);

    await expect(useCase.execute({ numero_documento: '123', id_plan: 999 } as any, {} as any)).rejects.toThrow(NotFoundException);
  });
});
