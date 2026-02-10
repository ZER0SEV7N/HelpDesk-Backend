//src/auth/guards/role.guard.ts
//Validacion de roles para rutas protegidas
//----------------------------------------------------------
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/role.decorator';
import { Observable } from 'rxjs';

//Guardia para verificar roles de usuario
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ], 
    );

    if(!requiredRoles) {
        return true; //Si no hay roles requeridos, permite el acceso
    }
    
    const { user } = context.switchToHttp().getRequest(); //Obtiene el usuario del request

    return requiredRoles.includes(user.rol.nombre); //Verifica si el rol del usuario esta en los roles requeridos

    }
}