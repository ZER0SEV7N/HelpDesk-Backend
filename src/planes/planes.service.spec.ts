import { Test, TestingModule } from '@nestjs/testing';
import { PlanesService } from './planes.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Planes } from '@/entities/Planes.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('PlanesService', () => {
  let service: PlanesService;
  let planesRepo: Repository<Planes>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlanesService,
        {
          provide: getRepositoryToken(Planes),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PlanesService>(PlanesService);
    planesRepo = module.get<Repository<Planes>>(getRepositoryToken(Planes));
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  it('debería crear un plan', async () => {
    jest.spyOn(planesRepo, 'create').mockReturnValue({} as any);
    jest.spyOn(planesRepo, 'save').mockResolvedValue({ id_plan: 1 } as any);

    const result = await service.create({ numero_plan: 1, tipo: 'Básico', servicios: [], precio: 100, limite_equipos: 10 } as any);
    expect(result).toHaveProperty('id_plan');
  });

  it('debería buscar todos los planes activos', async () => {
    jest.spyOn(planesRepo, 'find').mockResolvedValue([{ id_plan: 1 }] as any);
    const result = await service.findAll();
    expect(result).toHaveLength(1);
  });

  it('debería buscar plan por id', async () => {
    jest.spyOn(planesRepo, 'findOne').mockResolvedValue({ id_plan: 1 } as any);
    const result = await service.findOne(1);
    expect(result.id_plan).toBe(1);
  });

  it('debería fallar si plan no existe', async () => {
    jest.spyOn(planesRepo, 'findOne').mockResolvedValue(null as any);
    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  });

  it('debería actualizar plan', async () => {
    jest.spyOn(planesRepo, 'findOne').mockResolvedValue({ id_plan: 1, tipo: 'Básico' } as any);
    jest.spyOn(planesRepo, 'save').mockResolvedValue({ id_plan: 1, tipo: 'Premium' } as any);

    const result = await service.update(1, { tipo: 'Premium' } as any);
    expect(result.tipo).toBe('Premium');
  });

  it('debería desactivar plan', async () => {
    jest.spyOn(planesRepo, 'findOne').mockResolvedValue({ id_plan: 1, is_active: true } as any);
    jest.spyOn(planesRepo, 'save').mockResolvedValue({} as any);

    const result = await service.deactivate(1);
    expect(result.message).toContain('archivado');
  });

  it('debería reactivar plan', async () => {
    jest.spyOn(planesRepo, 'findOne').mockResolvedValue({ id_plan: 1, is_active: false } as any);
    jest.spyOn(planesRepo, 'save').mockResolvedValue({} as any);

    const result = await service.activate(1);
    expect(result.message).toContain('reactivado');
  });

  it('debería fallar al desactivar plan ya inactivo', async () => {
    jest.spyOn(planesRepo, 'findOne').mockResolvedValue({ id_plan: 1, is_active: false } as any);
    await expect(service.deactivate(1)).rejects.toThrow(BadRequestException);
  });

  it('debería fallar al activar plan ya activo', async () => {
    jest.spyOn(planesRepo, 'findOne').mockResolvedValue({ id_plan: 1, is_active: true } as any);
    await expect(service.activate(1)).rejects.toThrow(BadRequestException);
  });
});
