import { Controller } from '@nestjs/common';
import { HardwareService } from './hardware.service';

@Controller('hardware')
export class HardwareController {
  constructor(private readonly hardwareService: HardwareService) {}
}
