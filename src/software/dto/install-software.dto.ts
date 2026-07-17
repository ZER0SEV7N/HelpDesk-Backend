import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class InstallSoftwareDto {
    // ID del equipo donde se instalará el software
    @IsNumber()
    @Type(() => Number)
    id_equipo: number;

    // Licencia asignada al software en el equipo
    @IsString()
    @IsNotEmpty()
    licencia_asignada: string;

    // Observaciones adicionales sobre la instalación
    @IsString()
    @IsOptional()
    observaciones?: string;
}