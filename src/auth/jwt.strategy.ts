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
            jwtFromRequest: ExtractJwt.fromExtractors([
                // 1er intento: Buscar en la Cookie
                (req: Request) => {
                    let token = req?.cookies?.['jwt'];
                    console.log('🔴 Token en Cookie:', token ? '¡Encontrado!' : 'Vacío');
                    
                    // Novedad: Espiamos las cabeceras para ver si Thunder Client hizo su trabajo
                    console.log('🟡 Cabecera Authorization:', req?.headers?.authorization ? '¡Llegó un Bearer!' : 'Vacía');
                    
                    // ¡CLAVE! Si no hay token en la cookie, devolvemos null explícitamente para que pase al intento 2
                    return token ? token : null; 
                },
                // 2do intento: Buscar en el Bearer Token
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