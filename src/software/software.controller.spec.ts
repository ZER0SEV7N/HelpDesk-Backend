import { Test, TestingModule } from '@nestjs/testing';
import { SoftwareController } from './software.controller';
import { SoftwareService } from './software.service';
import { CreateSoftwareDto } from './dto/create-software.dto';
import { UpdateSoftwareDto } from './dto/update-software.dto';

describe('SoftwareController', () => {
  let controller: SoftwareController;
  let service: SoftwareService;

  const mockSoftwareService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SoftwareController],
      providers: [
        {
          provide: SoftwareService,
          useValue: mockSoftwareService,
        },
      ],
    }).compile();

    controller = module.get<SoftwareController>(SoftwareController);
    service = module.get<SoftwareService>(SoftwareService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service.create with dto', () => {
    const dto: CreateSoftwareDto = {
      nombre_software: 'Office 365',
      licencia: 'ABC-123-XYZ',
      correo: 'soporte@empresa.com',
      contraseña: 'secreto123',
      fecha_instalacion: new Date('2026-01-10'),
      fecha_caducidad: new Date('2027-01-10'),
      proveedor: 'Microsoft',
    };

    mockSoftwareService.create.mockReturnValue('created');

    const result = controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toBe('created');
  });

  it('should call service.findAll', () => {
    mockSoftwareService.findAll.mockReturnValue(['item']);

    const result = controller.findAll();

    expect(service.findAll).toHaveBeenCalled();
    expect(result).toEqual(['item']);
  });

  it('should call service.findOne with numeric id', () => {
    mockSoftwareService.findOne.mockReturnValue('one');

    const result = controller.findOne(5);

    expect(service.findOne).toHaveBeenCalledWith(5);
    expect(result).toBe('one');
  });

  it('should call service.update with numeric id and dto', () => {
    const dto: UpdateSoftwareDto = {
      licencia: 'NEW-LICENSE',
    };

    mockSoftwareService.update.mockReturnValue('updated');

    const result = controller.update(3, dto);

    expect(service.update).toHaveBeenCalledWith(3, dto);
    expect(result).toBe('updated');
  });

  it('should call service.remove with numeric id', () => {
    mockSoftwareService.remove.mockReturnValue('removed');

    const result = controller.remove(9);

    expect(service.remove).toHaveBeenCalledWith(9);
    expect(result).toBe('removed');
  });
});
