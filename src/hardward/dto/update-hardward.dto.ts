import { PartialType } from '@nestjs/mapped-types';
import { CreateHardwardDto } from './create-hardward.dto';

export class UpdateHardwardDto extends PartialType(CreateHardwardDto) {}
