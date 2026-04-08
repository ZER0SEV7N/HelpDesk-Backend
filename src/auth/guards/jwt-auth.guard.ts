//helpdesk-app/src/auth/jwt-auth.guard.ts
//Guardia de autenticacion JWT
//----------------------------------------------------------
import { AuthGuard } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    //Podemos sobreescribir métodos como handleRequest para personalizar el comportamiento del guardia
    handleRequest(err, user, info) {
        //Si hay un error o no se encuentra un usuario válido, lanzamos una excepción de autenticación
        if (err || !user) {
            throw err || new UnauthorizedException('Token inválido o expirado');
        }
        //Si el token es válido, retornamos el usuario para que esté disponible en los controladores protegidos
        return user;
    }
}