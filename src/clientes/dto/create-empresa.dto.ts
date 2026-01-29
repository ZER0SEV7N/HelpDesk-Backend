//scr/clientes/dto/create-empresa.dto.ts
//DTO para la creacion de una nueva empresa
//Importaciones necesarias:
import { IsString, IsNotEmpty, Length, IsEmail } from 'class-validator';

export class CreateEmpresaDto {
    @IsString()
    @IsNotEmpty()
    @Length(3, 50)
    nombre_cliente: string; //Nombre de la empresa

    @IsString()
    @IsNotEmpty()
    @Length(11, 11)
    ruc: string; //RUC de la empresa

    @IsString()
    @IsNotEmpty()
    direccion: string; //Direccion de la empresa

    @IsString()
    @IsNotEmpty()
    telefono: string; //Telefono de la empresa

    @IsEmail()
    @IsNotEmpty()
    correo: string; //Correo de la empresa
}