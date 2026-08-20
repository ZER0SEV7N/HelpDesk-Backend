import { Test, TestingModule } from '@nestjs/testing';
import { SoftwareService } from './software.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Software } from '@/entities/Software.entity';
import { Software_equipos } from '@/entities/SoftwareEquipos.entity';
import { Equipos } from '@/entities/Equipos.entity';
import { BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';

describe('SoftwareService', () => {
  let service: SoftwareService;
  let softwareRepo: Repository<Software>;
  let softwareEquiposRepo: Repository<Software_equipos>;
  let equiposRepo: Repository<Equipos>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SoftwareService,
        {
          provide: getRepositoryToken(Software),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            preload: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Software_equipos),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Equipos),
          useValue: {
            findOneBy: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SoftwareService>(SoftwareService);
    softwareRepo = module.get<Repository<Software>>(getRepositoryToken(Software));
    softwareEquiposRepo = module.get<Repository<Software_equipos>>(getRepositoryToken(Software_equipos));
    equiposRepo = module.get<Repository<Equipos>>(getRepositoryToken(Equipos));
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  it('debería crear software', async () => {
    const dto = { nombre_software: 'Windows', version: '1', fabricante: 'MS', tipo_licencia: 'OEM', fecha_instalacion: '2024-01-01', fecha_caducidad: '2025-01-01' };
    jest.spyOn(softwareRepo, 'create').mockReturnValue({} as any);
    jest.spyOn(softwareRepo, 'save').mockResolvedValue({ id_software: 1 } as any);

    const result = await service.create(dto as any);
    expect(result).toHaveProperty('id_software');
  });

  it('debería fallar si las fechas son inválidas', async () => {
    const dto = { nombre_software: 'Windows', version: '1', fabricante: 'MS', tipo_licencia: 'OEM', fecha_instalacion: 'invalida', fecha_caducidad: '2025-01-01' };
    await expect(service.create(dto as any)).rejects.toThrow(BadRequestException);
  });

  it('debería buscar software por id', async () => {
    jest.spyOn(softwareRepo, 'findOne').mockResolvedValue({ id_software: 1 } as any);
    const result = await service.findOne(1);
    expect(result.id_software).toBe(1);
  });

  it('debería fallar si software no existe', async () => {
    jest.spyOn(softwareRepo, 'findOne').mockResolvedValue(null as any);
    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  });

  it('debería eliminar (desactivar) software', async () => {
    jest.spyOn(softwareRepo, 'findOne').mockResolvedValue({ id_software: 1, is_active: true } as any);
    jest.spyOn(softwareRepo, 'save').mockResolvedValue({} as any);

    const result = await service.remove(1);
    expect(result.message).toContain('desactivado');
  });

  it('debería fallar si software ya está inactivo', async () => {
    jest.spyOn(softwareRepo, 'findOne').mockResolvedValue({ id_software: 1, is_active: false } as any);
    await expect(service.remove(1)).rejects.toThrow(BadRequestException);
  });

  it('debería instalar software en equipo', async () => {
    jest.spyOn(softwareRepo, 'findOne').mockResolvedValue({ id_software: 1, is_active: true, nombre_software: 'Win' } as any);
    jest.spyOn(equiposRepo, 'findOneBy').mockResolvedValue({ id_equipo: 1, numero_serie: 'SN123' } as any);
    jest.spyOn(softwareEquiposRepo, 'findOne').mockResolvedValue(null as any);
    jest.spyOn(softwareEquiposRepo, 'create').mockReturnValue({} as any);
    jest.spyOn(softwareEquiposRepo, 'save').mockResolvedValue({ id: 1 } as any);

    const result = await service.installSoftware(1, 1, 'LIC123', 'Observación');
    expect(result).toHaveProperty('id');
  });

  it('debería fallar si software ya está instalado en el equipo', async () => {
    jest.spyOn(softwareRepo, 'findOne').mockResolvedValue({ id_software: 1, is_active: true, nombre_software: 'Win' } as any);
    jest.spyOn(equiposRepo, 'findOneBy').mockResolvedValue({ id_equipo: 1, numero_serie: 'SN123' } as any);
    jest.spyOn(softwareEquiposRepo, 'findOne').mockResolvedValue({ id: 1 } as any);

    await expect(service.installSoftware(1, 1, 'LIC123', 'Obs')).rejects.toThrow(ConflictException);
  });
});
