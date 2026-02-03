//src/auth/jwt.strategy.ts
//Modulo Encargado de la estrategia JWT para autenticacion
//----------------------------------------------------------
//Importaciones necesarias:
import { Injectable } from '@nestjs/common'; //Decorador Injectable de NestJS
import { PassportStrategy } from '@nestjs/passport'; //Para crear estrategias de autenticacion
import { Strategy, ExtractJwt } from 'passport-jwt'; //Estrategia JWT de Passport

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), //Extrae el Token del header Authorization
            ignoreExpiration: false, //No ignora la expiracion del token
            secretOrKey: 'Token_Secreto' //Clave secreta para firmar el token. (Mas adelante se cambia por el .env)
        });
    }

    //Funcion para validar el token JWT y extraer la carga util (payload)
    async validate(payload: any) {
        return { userId: payload.sub, username: payload.correo, rol: payload.rol };
    }
}