import { IsNumber, IsString, IsNotEmpty, IsOptional, Min } from 'class-validator';

export class CreatePlanDto {
  @IsNumber()
  @Min(0)
  numero_plan: number;

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsNumber()
  @Min(0)
  precio: number;
}
