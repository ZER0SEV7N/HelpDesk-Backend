import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CancelCitaDto {
  @IsNotEmpty({ message: 'El motivo de cancelación es obligatorio.' })
  @IsString({ message: 'El motivo de cancelación debe ser texto.' })
  @MinLength(5, { message: 'El motivo debe tener al menos 5 caracteres.' })
  motivo_cancelacion: string;
}
