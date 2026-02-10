//helpdesk-app/src/auth/jwt-auth.guard.ts
//Guardia de autenticacion JWT
//----------------------------------------------------------
import { AuthGuard } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}