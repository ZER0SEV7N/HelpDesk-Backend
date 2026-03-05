//src/equipos/dto/create-equipos.dto.ts
//DTO para crear un nuevo equipo
//Importaciones necesarias
import { IsNumber, IsString, IsOptional, IsDateString } from 'class-validator'

export class CreateEquipoDTO {

    //Propiedad para el tipo de equipo
    @IsString()
    tipo: string;

    //Propiedad para la Marca
    @IsString()
    marca: string;

    //Propiedad para el numero de serie
    @IsString()
    numero_serie: string;

    //Propiedad para el nombre de usuario
    @IsString()
    nombre_usuario: string;

    //Propiedad para el area de trabajo
    @IsString()
    area: string;

    //Propiedad para la fecha de ultima revision
    @IsOptional()
    @IsDateString()
    ultRevision?: Date;

    //Propiedad para la fecha de revision programada
    @IsOptional()
    @IsDateString()
    revProgramada?: Date;

    @IsOptional()
    @IsString()
    id_empresa?: string; // MongoDB ObjectId

    @IsOptional()
    @IsString()
    id_plan?: string; // MongoDB ObjectId

}