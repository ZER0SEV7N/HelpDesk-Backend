import { Test, TestingModule } from '@nestjs/testing';
import { HardwardController } from './hardward.controller';
import { HardwardService } from './hardward.service';

describe('HardwardController', () => {
  let controller: HardwardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HardwardController],
      providers: [HardwardService],
    }).compile();

    controller = module.get<HardwardController>(HardwardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
