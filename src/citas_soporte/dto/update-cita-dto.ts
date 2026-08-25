import { IsOptional, IsString, IsInt } from 'class-validator';

export class UpdateCitaDto {
  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser texto.' })
  observaciones?: string;

  @IsOptional()
  @IsInt({ message: 'El ID del técnico debe ser un número entero.' })
  id_soporte_insitu?: number;
}
