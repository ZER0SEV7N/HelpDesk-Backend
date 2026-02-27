import { PartialType } from '@nestjs/mapped-types';
import { CreateHardwareDto } from './create-hardware.dto';

export class UpdateHardwareDto extends PartialType(CreateHardwareDto) {}
