// src/modules/usuario/dto/user-response.dto.ts
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
  empresa_nombre: string | null;
  sucursal_nombre: string | null;
  created_at: Date;
}
