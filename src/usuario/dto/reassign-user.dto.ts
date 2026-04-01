//src/usuario/dto/reassign-user.dto.ts
import { IsNumber, IsOptional } from 'class-validator';

export class ReassignUserDto {
  @IsOptional()
  @IsNumber()
  id_cliente?: number;

  @IsOptional()
  @IsNumber()
  id_sucursal?: number;
}