//DTO para actualizar el contrato de un cliente
//Importaciones necesarias:
import { IsInt, IsDateString, IsOptional, IsNumber } from 'class-validator';

export class UpdateContractDto {
    
    @IsInt()
    id_plan: number; //Nuevo plan a asignar
    
    @IsDateString({}, { message: 'Debe ser una fecha válida (YYYY-MM-DD)' })
    nuevaFechaInicio: string;
    
    @IsDateString({}, { message: 'Debe ser una fecha válida (YYYY-MM-DD)' })
    nuevaFechaFin: string;

    @IsOptional()
    @IsNumber()
    nuevoCosto?: number; //Costo negociado para este cliente (opcional)
    
    @IsOptional()
    @IsNumber()
    nuevoLimite?: number; //Nuevo limite de equipos para este cliente (opcional)
}