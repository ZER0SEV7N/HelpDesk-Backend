//helpdesk-app/src/auth/decorators/role.decorator.ts
//Decorador para roles de usuario
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles'; //Clave para los metadatos de roles

export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles); //Decorador que asigna roles a rutas o controladores