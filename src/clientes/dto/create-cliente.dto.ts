//scr/clientes/dto/create-empresa.dto.ts
//DTO para la creacion de una nueva empresa
//Importaciones necesarias:
import { IsString, IsNotEmpty, Length, IsEmail, IsEnum, IsOptional, MaxLength, IsInt, IsDateString, IsNumber } from 'class-validator';
import { TipoCliente } from 'src/entities/Clientes.entity';

export class CreateClienteDto {
    @IsEnum(TipoCliente, {message: 'El tipo de cliente debe de ser juridica o Natural'})
    tipo_cliente: TipoCliente; //Tipo de cliente

    @IsString()
    @IsNotEmpty({ message: "El numero de documento es obligatorio"})
    @MaxLength(20, { message: "El numero del documento tiene un limite de 20 caracteres"})
    numero_documento: string; //Documento de la empresa

    @IsString()
    @IsNotEmpty({ message: 'El nombre principal es obligatorio' })
    @MaxLength(150, {message: 'El nombre no puede exceder de 150 caracteres'})
    nombre_principal: string; //nombre principal de la empresa

    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    direccion: string; //Direccion de la empresa

    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    telefono: string; //Telefono de la empresa

    @IsEmail({}, { message: 'Debe ser un correo electrónico válido' })
    @IsNotEmpty()
    @MaxLength(100)
    correo: string; //Correo de la empresa

    @IsString()
    @IsOptional()
    @MaxLength(100)
    rubro?: string; //Rubro de la empresa

    @IsInt()
    @IsOptional()
    id_plan?: number; //Plan a utilizar

    @IsDateString({}, { message: 'Debe ser una fecha válida (YYYY-MM-DD)' })
    @IsOptional()
    fecha_finalizacion_plan?: string; //Fecha de finalizacion de contrato del plan

    @IsOptional()
    @IsDateString() // o @IsString()
    fecha_inicio_plan?: string;

    @IsOptional()
    @IsNumber()
    costo_negociado?: number;

    @IsOptional()
    @IsNumber()
    limite_equipos_contratado?: number;
}