//helpdesk-app/src/auth/jwt-auth.guard.ts
//Guardia de autenticacion JWT
//----------------------------------------------------------
import { AuthGuard } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

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
  handleRequest(err: Error | null, user: JwtPayload | null) {
    if (err || !user)
      throw err || new UnauthorizedException('Token inválido o expirado');

    return user as any;
  }
}
