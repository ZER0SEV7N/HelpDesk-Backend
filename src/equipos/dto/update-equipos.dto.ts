import { PartialType } from '@nestjs/mapped-types';
import { CreateEquipoDTO } from './create-equipos.dto';

export class UpdateEquipoDto extends PartialType(CreateEquipoDTO) {}
