// src/hardware/dto/create-hardware.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
} from 'class-validator';

export class CreateHardwareDto {
  // --------------------------------------------------------
  // DATOS PRINCIPALES DE LA PIEZA
  // --------------------------------------------------------
  @IsString()
  @IsNotEmpty()
  tipo_equipo: string; // Ej: "Disco Duro SSD", "Memoria RAM", "Monitor"

  @IsString()
  @IsNotEmpty()
  numero_serie: string; // El serial único del fabricante

  @IsString()
  @IsNotEmpty()
  marca: string; // Ej: "Western Digital", "Corsair"

  @IsString()
  @IsNotEmpty()
  proveedor: string; // Ej: "PC Factory", "Amazon"

  @IsString()
  @IsNotEmpty()
  descripcion: string; // Ej: "SSD NVMe de 1TB para servidores"

  @IsDateString()
  @IsNotEmpty()
  fecha_compra: string; // Cuándo ingresó a tu inventario

  // --------------------------------------------------------
  // FECHAS DE MANTENIMIENTO (Opcionales al registrar)
  // --------------------------------------------------------
  @IsDateString()
  @IsOptional()
  ult_revision?: string;

  @IsDateString()
  @IsOptional()
  rev_programada?: string;
}