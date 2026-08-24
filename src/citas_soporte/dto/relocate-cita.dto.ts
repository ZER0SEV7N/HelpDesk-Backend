import { IsNotEmpty, IsString, IsDateString } from 'class-validator';

export class RelocateCitaDto {
  @IsNotEmpty({ message: 'La nueva fecha programada es obligatoria.' })
  @IsDateString({}, { message: 'Debe ingresar una fecha ISO 8601 válida.' })
  nueva_fecha_programada: string;

  @IsNotEmpty({ message: 'El motivo de la reprogramación es obligatorio.' })
  @IsString({ message: 'El motivo debe ser una cadena de texto.' })
  motivo_reprogramacion: string;
}
