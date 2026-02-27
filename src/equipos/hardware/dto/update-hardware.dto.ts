//src/hardware/dto/update-hardware.dto.ts
//DTO para actualizar hardware
//Importaciones necesarias:
import { PartialType } from '@nestjs/mapped-types';
import { CreateHardwareDto } from './create-hardware.dto';

//Definicion del DTO UpdateHardwareDto
export class UpdateHardwareDto extends PartialType(CreateHardwareDto) {}
