import { IsOptional, IsString } from 'class-validator';

export class CompleteCitaDto {
  @IsOptional()
  @IsString({ message: 'Las observaciones de cierre deben ser texto.' })
  observaciones_cierre?: string;
}
