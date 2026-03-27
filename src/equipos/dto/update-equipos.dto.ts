// src/equipos/dto/update-equipos.dto.ts
// DTO para actualizar un equipo
import { PartialType } from '@nestjs/mapped-types';
import { CreateEquipoDTO } from './create-equipos.dto';

// Extendemos CreateEquipoDTO usando PartialType para que todas las propiedades sean opcionales
// Esto es útil para actualizar solo algunos campos del equipo
export class UpdateEquipoDto extends PartialType(CreateEquipoDTO) {}