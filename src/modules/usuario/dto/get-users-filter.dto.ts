//src/modules/usuario/dto/get-users-filter.dto.ts
import { IsOptional, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class GetUsersFilterDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    id_usuario?: number;

    @IsOptional()
    @IsString()
    rolNombre?: string;

    @IsOptional()
    @IsString()
    nombre?: string;

    @IsOptional()
    @IsString()
    cliente?: string; // Mapea con cliente.nombre_principal

    @IsOptional()
    @IsString()
    sucursal?: string; // Mapea con sucursal.nombre_sucursal
}