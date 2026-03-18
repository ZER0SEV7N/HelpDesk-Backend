//helpdesk-app/src/chat/dto/mensaje.dto.ts
//DTO para el mensaje del chat
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class MensajeDto{
    //Id del ticket al que pertenece el mensaje
    @IsNumber()
    @IsNotEmpty()
    ticketId: number;

    //Id del usuario que envio el mensaje (puede ser el cliente o el soporte tecnico)
    @IsNumber()
    @IsNotEmpty()
    userId: number;

    //Contenido del mensaje    
    @IsString()
    @IsNotEmpty()
    contenido: string;

    //Si se envian archivos no menor a 20mb,
    @IsString() //Valida que sea una cadena de texto (URL o base64)
    urlArchivo?: string;
}
