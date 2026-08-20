//helpdesk-app/src/auth/jwt-auth.guard.ts
//Guardia de autenticacion JWT
//----------------------------------------------------------
import { AuthGuard } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../modules/auth/auth.service';

export interface JwtPayload {
  sub: number;
  userId: number;
  role: string;
  clienteId?: number;
  sucursalId?: number;
  nombre?: string;
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly authService: AuthService) {
    super();
  }

  handleRequest(err: Error | null, user: JwtPayload | null) {
    if (err || !user)
      throw err || new UnauthorizedException('Token inválido o expirado');

    return user as any;
  }

  async canActivate(context: any): Promise<boolean> {
    const result = await super.canActivate(context);
    if (result instanceof Promise) {
      await result;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload | undefined;

    if (!user) {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    const isActive = await this.authService.isUserActive(user.sub);
    if (!isActive) {
      throw new UnauthorizedException('Usuario inactivo o eliminado');
    }

    return true;
  }
}
