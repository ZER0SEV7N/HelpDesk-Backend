// src/equipos/dto/create-equipos.dto.ts
// DTO para crear un nuevo equipo
// Importaciones necesarias para validación de datos
import { IsNumber, IsString, IsOptional, IsDateString, IsArray } from 'class-validator';

export class CreateEquipoDTO {
    // Propiedad para el tipo de equipo (Ej: Laptop, Desktop, Monitor)
    @IsString()
    tipo: string;

    // Propiedad para la marca del equipo
    @IsString()
    marca: string;

    // Propiedad para el número de serie del equipo
    @IsString()
    numero_serie: string;

    // Propiedad para el nombre de usuario asignado al equipo
    @IsString()
    nombre_usuario: string;

    // Propiedad para el área de trabajo o departamento del equipo
    @IsString()
    area: string;

    // Propiedad opcional: fecha de la última revisión del equipo
    // Se valida que sea un string en formato ISO (YYYY-MM-DD)
    @IsOptional()
    @IsDateString()
    ultRevision?: Date;

    // Propiedad opcional: fecha de la próxima revisión programada
    // Se valida que sea un string en formato ISO (YYYY-MM-DD)
    @IsOptional()
    @IsDateString()
    revProgramada?: Date;

    // Propiedad opcional: ID de la empresa asociada al equipo
    @IsOptional()
    @IsNumber()
    id_empresa?: number;

    // Propiedad opcional: ID de la microempresa asociada al equipo
    @IsOptional()
    @IsNumber()
    id_microempresa?: number;

    // Propiedad opcional: ID del plan asociado al equipo
    @IsOptional()
    @IsNumber()
    id_plan?: number;

    // Propiedad opcional: ID de la persona natural asociada al equipo
    @IsOptional()
    @IsNumber()
    id_personanatural?: number;

    // --- Nuevas propiedades opcionales para relaciones ---
    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true })
    hardwareIds?: number[]; // IDs de hardware asociados

    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true })
    softwareIds?: number[]; // IDs de software asociados
}