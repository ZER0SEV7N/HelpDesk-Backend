//helpdesk/src/clientes/dto/create-sucursal.dto.ts
//Dto para el manejo de los objetos para la creacion de sucursal
import { IsEmail, IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator'


export class CreateSucursalDto {
    @IsString()
    @IsNotEmpty({message: 'El nombre de la sucursal es obligatorio'})
    nombre_sucursal: string; //Nombre de la sucursal

    @IsString()
    @IsNotEmpty({message: 'El nombre del encargado es obligatorio'})
    encargado: string;

    @IsString()
    @IsNotEmpty({message: 'El telefono es obligatorio'})
    @MaxLength(20)
    telefono: string;

    @IsEmail()
    @IsNotEmpty()
    correo: string;

    @IsString()
    @IsNotEmpty()
    direccion: string;

    @IsInt()
    @Min(1)
    @IsNotEmpty({ message: 'Debe especificar que cliente pertenece esa sucursal '})
    id_cliente: number;
}