//src/usuario/dto/user-response.dto.ts
export class UserResponseDto {
  id_usuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  is_active: boolean;
  rol: {
    id_rol: number;
    nombre: string;
  };
  cliente_nombre?: string;
  sucursal_nombre?: string;
  created_at: Date;
}