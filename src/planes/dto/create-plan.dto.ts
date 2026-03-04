//helpdesk-app/src/planes/dto/create-plan.dto.ts
//DTO para crear un nuevo plan
import { IsNumber, IsString, IsNotEmpty, IsOptional, Min } from 'class-validator';

//Definicion del DTO para crear un nuevo plan
export class CreatePlanDto {

  //Numero del plan, debe ser un numero entero positivo
  @IsNumber()
  @Min(0)
  numero_plan: number;

  //Nombre del plan, debe ser una cadena de texto no vacia
  @IsString()
  @IsNotEmpty()
  nombre: string;

  //Descripcion del plan, debe ser una cadena de texto no vacia
  @IsString()
  @IsNotEmpty()
  descripcion: string;

  //Precio del plan, debe ser un numero positivo
  @IsNumber()
  @Min(0)
  precio: number;
}
