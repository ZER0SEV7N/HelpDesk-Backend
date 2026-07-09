//helpdesk/src/clientes/dto/create-area.dto.ts
//Dto para el manejo de los objetos para la creacion de un area
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateAreaDTO {
  @IsString()
  @IsNotEmpty({ message: 'EL nombre de area debe de ser obligatorio' })
  @MaxLength(100)
  nombre_area: string;

  @IsString()
  @IsNotEmpty({ message: 'El contacto del área es obligatorio' })
  @MaxLength(100)
  contacto: string;

  @IsString()
  @IsNotEmpty({ message: 'El teléfono es obligatorio' })
  @MaxLength(20)
  telefono: string;

  @IsEmail({}, { message: 'Debe ser un correo electrónico válido' })
  @IsNotEmpty({ message: 'El correo es obligatorio' })
  @MaxLength(100)
  correo: string;

  @IsInt({ message: 'El ID de la sucursal debe de ser un numero entero' })
  @IsNotEmpty({ message: 'El ID de la sucursal es obligatorio' })
  @Min(1)
  @IsNotEmpty({ message: 'El ID de la sucursal es requerido' })
  id_sucursal: number;
}
