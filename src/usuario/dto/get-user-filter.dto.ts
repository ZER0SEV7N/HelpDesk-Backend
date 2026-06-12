//src/usuario/dto/get-users-filter.dto.ts
//DTO para filtrar usuarios en la lista
//Permite filtrar por id_usuario, rol, nombre, cliente o sucursal
import { IsOptional, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class GetUsersFilterDto{

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
    cliente?: string;

    @IsOptional()
    @IsString()
    sucursal?: string;
}
