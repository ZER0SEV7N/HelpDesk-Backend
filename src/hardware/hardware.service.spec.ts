import { Test, TestingModule } from '@nestjs/testing';
import { HardwareService } from './hardware.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hardware } from '@/entities/Hardware.entity';
import { RegistroHardware } from '@/entities/RegistroHardware.entity';
import { Equipos } from '@/entities/Equipos.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('HardwareService', () => {
  let service: HardwareService;
  let hardwareRepo: Repository<Hardware>;
  let regHardRepo: Repository<RegistroHardware>;
  let equiposRepo: Repository<Equipos>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HardwareService,
        {
          provide: getRepositoryToken(Hardware),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(RegistroHardware),
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

    service = module.get<HardwareService>(HardwareService);
    hardwareRepo = module.get<Repository<Hardware>>(getRepositoryToken(Hardware));
    regHardRepo = module.get<Repository<RegistroHardware>>(getRepositoryToken(RegistroHardware));
    equiposRepo = module.get<Repository<Equipos>>(getRepositoryToken(Equipos));
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  it('debería crear hardware', async () => {
    jest.spyOn(hardwareRepo, 'create').mockReturnValue({} as any);
    jest.spyOn(hardwareRepo, 'save').mockResolvedValue({ id_hardware: 1 } as any);

    const result = await service.create({ tipo: 'RAM', marca: 'Kingston', modelo: 'X', especificaciones: '8GB' } as any);
    expect(result).toHaveProperty('id_hardware');
  });

  it('debería buscar hardware por id', async () => {
    jest.spyOn(hardwareRepo, 'findOne').mockResolvedValue({ id_hardware: 1 } as any);
    const result = await service.findOne(1);
    expect(result.id_hardware).toBe(1);
  });

  it('debería fallar si hardware no existe', async () => {
    jest.spyOn(hardwareRepo, 'findOne').mockResolvedValue(null as any);
    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  });

  it('debería eliminar (desactivar) hardware', async () => {
    jest.spyOn(hardwareRepo, 'findOne').mockResolvedValue({ id_hardware: 1, is_active: true } as any);
    jest.spyOn(hardwareRepo, 'save').mockResolvedValue({} as any);

    const result = await service.remove(1);
    expect(result.message).toContain('desactivado');
  });

  it('debería fallar si hardware ya está inactivo', async () => {
    jest.spyOn(hardwareRepo, 'findOne').mockResolvedValue({ id_hardware: 1, is_active: false } as any);
    await expect(service.remove(1)).rejects.toThrow(BadRequestException);
  });

  it('debería instalar hardware en equipo', async () => {
    jest.spyOn(hardwareRepo, 'findOne').mockResolvedValue({ id_hardware: 1, is_active: true } as any);
    jest.spyOn(equiposRepo, 'findOneBy').mockResolvedValue({ id_equipo: 1 } as any);
    jest.spyOn(regHardRepo, 'create').mockReturnValue({} as any);
    jest.spyOn(regHardRepo, 'save').mockResolvedValue({ id: 1 } as any);

    const result = await service.installHardware(1, 1, 'Desc', 'SN123', 'Prov');
    expect(result).toHaveProperty('id');
  });

  it('debería fallar al instalar hardware inactivo', async () => {
    jest.spyOn(hardwareRepo, 'findOne').mockResolvedValue({ id_hardware: 1, is_active: false } as any);
    await expect(service.installHardware(1, 1, 'Desc', 'SN123', 'Prov')).rejects.toThrow(BadRequestException);
  });
});
