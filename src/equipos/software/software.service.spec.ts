// src/software/software.service.spec.ts
// Tests unitarios para SoftwareService usando Jest y NestJS

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { SoftwareService } from './software.service';
import { CreateSoftwareDto } from './dto/create-software.dto';
import { UpdateSoftwareDto } from './dto/update-software.dto';
import { Software } from '../../entities/Software.entity';

describe('SoftwareService', () => {
  let service: SoftwareService;

  // Mock del repositorio de Software
  const mockSoftwareRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    preload: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SoftwareService,
        {
          provide: getRepositoryToken(Software),
          useValue: mockSoftwareRepository,
        },
      ],
    }).compile();

    service = module.get<SoftwareService>(SoftwareService);
    jest.clearAllMocks(); // Limpiar los mocks antes de cada test
  });

  // Verifica que el servicio se define correctamente
  it('debe definirse', () => {
    expect(service).toBeDefined();
  });

  // Test de creación de software
  it('debería crear y guardar un software', async () => {
    const dto: CreateSoftwareDto = {
      nombre_software: 'Office 365',
      licencia: 'ABC-123-XYZ',
      correo: 'soporte@empresa.com',
      contraseña: 'secreto123',
      fecha_instalacion: '2026-01-10',
      fecha_caducidad: '2027-01-10',
      proveedor: 'Microsoft',
    };

    // Mock completo de la entidad, incluyendo todas las propiedades obligatorias
    const createdEntity = {
      id_software: 1,
      nombre_software: dto.nombre_software,
      licencia: dto.licencia,
      correo: dto.correo,
      contraseña: dto.contraseña,
      fecha_instalacion: new Date(dto.fecha_instalacion),
      fecha_caducidad: new Date(dto.fecha_caducidad),
      proveedor: dto.proveedor,
      is_active: true,
      se: [],
      created_at: new Date(),
      updated_at: new Date(),
    } as Software;

    mockSoftwareRepository.create.mockReturnValue(createdEntity);
    mockSoftwareRepository.save.mockResolvedValue(createdEntity);

    const result = await service.create(dto);

    expect(mockSoftwareRepository.create).toHaveBeenCalledWith(dto);
    expect(mockSoftwareRepository.save).toHaveBeenCalledWith(createdEntity);
    expect(result).toEqual(createdEntity);
  });

  // Test para listar todos los software
  it('debería listar todos los software', async () => {
    const softwareList = [
      {
        id_software: 1,
        nombre_software: 'Office',
        licencia: 'ABC',
        correo: 'correo@empresa.com',
        contraseña: '123',
        fecha_instalacion: new Date(),
        fecha_caducidad: new Date(),
        proveedor: 'Microsoft',
        is_active: true,
        se: [],
        created_at: new Date(),
        updated_at: new Date(),
      } as Software,
    ];

    mockSoftwareRepository.find.mockResolvedValue(softwareList);
    const result = await service.findAll();

    expect(mockSoftwareRepository.find).toHaveBeenCalled();
    expect(result).toEqual(softwareList);
  });

  // Test para obtener un software por ID
  it('debería retornar un software por id', async () => {
    const software = {
      id_software: 7,
      nombre_software: 'Office',
      licencia: 'ABC',
      correo: 'correo@empresa.com',
      contraseña: '123',
      fecha_instalacion: new Date(),
      fecha_caducidad: new Date(),
      proveedor: 'Microsoft',
      is_active: true,
      se: [],
      created_at: new Date(),
      updated_at: new Date(),
    } as Software;

    mockSoftwareRepository.findOneBy.mockResolvedValue(software);
    const result = await service.findOne(7);

    expect(mockSoftwareRepository.findOneBy).toHaveBeenCalledWith({ id_software: 7 });
    expect(result).toEqual(software);
  });

  // Test para findOne cuando el software no existe
  it('debería lanzar NotFoundException en findOne cuando no existe', async () => {
    mockSoftwareRepository.findOneBy.mockResolvedValue(null);
    await expect(service.findOne(99)).rejects.toBeInstanceOf(NotFoundException);
  });

  // Test para actualizar un software existente
  it('debería actualizar un software existente', async () => {
    const dto: UpdateSoftwareDto = {
      licencia: 'NEW-LICENSE',
    };

    const preloaded = {
      id_software: 4,
      nombre_software: 'Office',
      licencia: 'NEW-LICENSE',
      correo: 'correo@empresa.com',
      contraseña: '123',
      fecha_instalacion: new Date(),
      fecha_caducidad: new Date(),
      proveedor: 'Microsoft',
      is_active: true,
      se: [],
      created_at: new Date(),
      updated_at: new Date(),
    } as Software;

    mockSoftwareRepository.preload.mockResolvedValue(preloaded);
    mockSoftwareRepository.save.mockResolvedValue(preloaded);

    const result = await service.update(4, dto);

    expect(mockSoftwareRepository.preload).toHaveBeenCalledWith({
      id_software: 4,
      ...dto,
    });
    expect(mockSoftwareRepository.save).toHaveBeenCalledWith(preloaded);
    expect(result).toEqual(preloaded);
  });

  // Test para update cuando el software no existe
  it('debería lanzar NotFoundException en update cuando no existe', async () => {
    mockSoftwareRepository.preload.mockResolvedValue(null);
    await expect(service.update(4, { licencia: 'X' })).rejects.toBeInstanceOf(NotFoundException);
  });

  // Test para eliminar un software existente
  it('debería eliminar un software existente', async () => {
    const software = {
      id_software: 9,
      nombre_software: 'Office',
      licencia: 'ABC',
      correo: 'correo@empresa.com',
      contraseña: '123',
      fecha_instalacion: new Date(),
      fecha_caducidad: new Date(),
      proveedor: 'Microsoft',
      is_active: true,
      se: [],
      created_at: new Date(),
      updated_at: new Date(),
    } as Software;

    mockSoftwareRepository.findOneBy.mockResolvedValue(software);
    mockSoftwareRepository.remove.mockResolvedValue(software);

    const result = await service.remove(9);

    expect(mockSoftwareRepository.findOneBy).toHaveBeenCalledWith({ id_software: 9 });
    expect(mockSoftwareRepository.remove).toHaveBeenCalledWith(software);
    expect(result).toEqual({ message: 'Software con id 9 eliminado correctamente' });
  });
});