import { Test, TestingModule } from '@nestjs/testing';
import { HardwardService } from './hardward.service';

describe('HardwardService', () => {
  let service: HardwardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HardwardService],
    }).compile();

    service = module.get<HardwardService>(HardwardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
