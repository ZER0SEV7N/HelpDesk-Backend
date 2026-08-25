import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
  IsArray,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCitaDto {
  @IsNotEmpty({ message: 'Debe enviar al menos un ticket.' })
  @Transform(({ value }) => {
    // Si viene como Array desde el JSON, lo convertimos a Set
    if (Array.isArray(value)) {
      return new Set(value.map((id) => Number(id)));
    }
    return value;
  })
  ticket_ids: Set<number>;

  @IsNotEmpty({ message: 'La sucursal es obligatoria.' })
  @IsNumber({}, { message: 'id_sucursal debe ser un número.' })
  id_sucursal: number;

  @IsNotEmpty({ message: 'La fecha programada es obligatoria.' })
  @IsDateString(
    {},
    { message: 'fecha_programada debe ser una fecha ISO válida.' },
  )
  fecha_programada: Date;

  @IsNotEmpty({ message: 'El soporte in situ es obligatorio.' })
  @IsNumber({}, { message: 'id_soporte debe ser un número.' })
  id_soporte?: number;
}
