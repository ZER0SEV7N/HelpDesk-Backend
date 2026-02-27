import { Test, TestingModule } from '@nestjs/testing';
import { HardwareService } from './hardware.service';

describe('HardwareService', () => {
  let service: HardwareService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HardwareService],
    }).compile();

    service = module.get<HardwareService>(HardwareService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
