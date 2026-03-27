// src/equipos/dto/create-equipos.dto.ts
import { IsNumber, IsString, IsOptional, IsDateString, IsNotEmpty } from 'class-validator';

export class CreateEquipoDTO {
    // --------------------------------------------------------
    // DATOS FÍSICOS DEL EQUIPO
    // --------------------------------------------------------
    @IsString()
    @IsNotEmpty()
    tipo: string; // Ej: Laptop, Desktop, Servidor

    @IsString()
    @IsNotEmpty()
    marca: string; // Ej: Dell, Lenovo, HP

    @IsString()
    @IsNotEmpty()
    numero_serie: string; // Etiqueta de servicio o serial

    // --------------------------------------------------------
    // ASIGNACIÓN (Opcionales, puede ser una PC nueva en bodega)
    // --------------------------------------------------------
    @IsOptional()
    @IsString()
    nombre_usuario?: string; // Ej: "Juan Perez"

    @IsOptional()
    @IsString()
    area?: string; // Ej: "Contabilidad"

    // --------------------------------------------------------
    // FECHAS DE MANTENIMIENTO
    // --------------------------------------------------------
    @IsOptional()
    @IsDateString()
    ult_revision?: Date;

    @IsOptional()
    @IsDateString()
    rev_programada?: Date;

    // --------------------------------------------------------
    // RELACIONES EXACTAS DE LA BASE DE DATOS
    // --------------------------------------------------------
    @IsNumber()
    @IsNotEmpty()
    id_cliente: number; // ¡Obligatorio! El equipo siempre es de Zaint o de una Empresa cliente

    @IsOptional()
    @IsNumber()
    id_sucursal?: number; // Para saber exactamente en qué local está la máquina
}