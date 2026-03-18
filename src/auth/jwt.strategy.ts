//src/auth/jwt.strategy.ts
//Modulo Encargado de la estrategia JWT para autenticacion
//----------------------------------------------------------
//Importaciones necesarias:
import { Injectable } from '@nestjs/common'; //Decorador Injectable de NestJS
import { PassportStrategy } from '@nestjs/passport'; //Para crear estrategias de autenticacion
import { Request } from 'express';
import { Strategy, ExtractJwt } from 'passport-jwt'; //Estrategia JWT de Passport

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            //Funcion para extraer el token JWT del header Authorization
            jwtFromRequest: (req: Request) =>{
                let token = null;
                if(req && req.cookies) {
                    token = req.cookies['jwt']; //Extrae el token de las cookies
                }
                return token;
            }, 
            ignoreExpiration: false, //No ignora la expiracion del token
            secretOrKey: 'Token_Secreto' //Clave secreta para firmar el token. (Mas adelante se cambia por el .env)
        });
    }

    //Funcion para validar el token JWT y extraer la carga util (payload)
    async validate(payload: any) {
        //En tu AuthService.login el payload tiene { sub, role }
        return { userId: payload.sub, 
            rol: payload.role };
    }
}