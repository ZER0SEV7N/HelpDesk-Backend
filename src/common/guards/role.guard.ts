//src/auth/guards/role.guard.ts
//Validacion de roles para rutas protegidas
//----------------------------------------------------------
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/role.decorator';
import { JwtPayload } from '../guards/jwt-auth.guard';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      user?: JwtPayload;
    }>();
    const user = request.user;

    if (!user || !user.role) return false;

    return requiredRoles.includes(user.role);
  }
}
