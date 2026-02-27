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

    //Propiedad para el ID de la empresa (opcional, ya que un equipo puede no estar asociado a una empresa)
    @IsOptional()
    @IsNumber()
    id_empresa?: number;

    //Propiedad para el ID de la microempresa (opcional, ya que un equipo puede no estar asociado a una microempresa)
    @IsOptional()
    @IsNumber()
    id_microempresa?: number;

    //Propiedad para el ID del plan (opcional, ya que un equipo puede no tener un plan asociado)
    @IsOptional()
    @IsNumber()
    id_plan?: number;

    //Propiedad para el ID de la persona natural (opcional, ya que un equipo puede no estar asociado a una persona natural)
    @IsOptional()
    @IsNumber()
    id_personanatural?: number;

}