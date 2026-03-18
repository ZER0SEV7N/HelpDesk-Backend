//src/ticket/dto/create-ticket.dto.ts
//DTO para la creacion de un ticket 
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';


export class CreateTicketDto {
    //Asunto del ticket | Tipo de Incidente
    @IsString() //Valida que sea una cadena de texto
    @IsNotEmpty() //Valida que no este vacio
    asunto: string;

    //Equipo afectado por el incidente
    @IsNumber() //Valida que sea un numero
    @IsNotEmpty() //Valida que no este vacio
    id_equipo: number;

    //Problema Relacionado al software
    @IsBoolean() //Valida que sea un booleano
    es_software: boolean;

    //Software relacionado (opcional)
    @IsOptional()
    @IsNumber() //Valida que sea un numero
    id_software?: number;

    //Detalle del incidente
    @IsString() //Valida que sea una cadena de texto
    @IsNotEmpty() //Valida que no este vacio
    detalle: string;

    //Imagen de evidencia (opcional)
    @IsOptional()
    @IsString() //Valida que sea una cadena de texto (URL o base64)
    imagen_url?: string;
}
