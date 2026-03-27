// src/software/dto/update-software.dto.ts
// DTO para actualizar un registro de Software (todos los campos son opcionales)
import { PartialType } from '@nestjs/mapped-types';
import { CreateSoftwareDto } from './create-software.dto';

export class UpdateSoftwareDto extends PartialType(CreateSoftwareDto) {}
