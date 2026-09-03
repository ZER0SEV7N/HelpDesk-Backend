import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional } from 'class-validator';

export class ClienteFilterParamDTO {
  @IsOptional()
  @IsEnum(['JURIDICA', 'NATURAL'])
  tipo_cliente?;

  @IsOptional()
  @Type(() => Number) // Parsea "0" (string) -> 0 (number)
  @IsInt() // Valida que sea un número entero
  estado?: number;
}
