//src/hardware/dto/create-hardware.dto.ts
//DTO para crear hardware
//Importaciones necesarias:
import { IsString, IsNotEmpty, IsDateString, IsOptional } from 'class-validator';

//Definicion del DTO CreateHardwareDto
export class CreateHardwareDto {
    @IsString()
    @IsNotEmpty()
    tipo_equipo: string; //Tipo de hardware (Ejemplo: Laptop, Desktop, Monitor, etc.)

    @IsString()
    @IsNotEmpty()
    numero_serie: string; //Numero de serie del hardware

    @IsDateString()
    @IsNotEmpty()
    fecha_compra: Date; //Fecha de compra del hardware

    @IsString()
    @IsNotEmpty()
    plan: string; //Plan de mantenimiento del hardware

    @IsString()
    @IsNotEmpty()
    marca: string; //Marca del hardware

    @IsString()
    @IsNotEmpty()
    proveedor: string; //Proveedor del hardware

    @IsString()
    @IsNotEmpty()
    descripcion: string; //Descripcion del hardware

    @IsDateString()
    @IsOptional()
    ult_revision?: Date; //Fecha de la ultima revision del hardware

    @IsDateString()
    @IsOptional()
    rev_programada?: Date; //Fecha de la proxima revision programada
}
