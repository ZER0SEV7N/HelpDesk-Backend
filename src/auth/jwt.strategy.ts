import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport'; 
import { Request } from 'express';
// Asegúrate de importar ExtractJwt
import { Strategy, ExtractJwt } from 'passport-jwt'; 
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private configService: ConfigService) {
        super({
            // Le damos una lista de lugares donde buscar el token
            jwtFromRequest: ExtractJwt.fromExtractors([
                // Opción 1: Buscar en las Cookies (Para tu frontend web)
                (req: Request) => {
                    let token = null;
                    if (req && req.cookies) {
                        token = req.cookies['jwt']; 
                    }
                    console.log('🔴 Token de Cookie:', token);
                    return token;
                },
                // Opción 2: Buscar en la cabecera Authorization (Para Thunder Client/Móviles)
                ExtractJwt.fromAuthHeaderAsBearerToken(),
            ]), 
            ignoreExpiration: false, 
            secretOrKey: configService.get<string>('JWT_SECRET')! 
        });
    }

    async validate(payload: any) {
        console.log('🔵 Payload descifrado:', payload); 
        return { 
            userId: payload.sub, 
            role: payload.role  
        };
    }
}