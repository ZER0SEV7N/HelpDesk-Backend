import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          const token = req?.cookies?.['jwt'];
          console.log('🔴 Token en Cookie:', token ? '¡Encontrado!' : 'Vacío');
          return token ? token : null;
        },
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]), 
      ignoreExpiration: false,
      secretOrKey: 
        configService.get<string>('JWT_SECRET') || 
        process.env.JWT_SECRET || 
        'ClaveSeguraAyudaDeRespaldoHelpdesk123!',
    });
  }

  // Este método se llama automáticamente después de que el token ha sido verificado con éxito
  async validate(payload: any) {
    console.log('🔵 Payload descifrado con éxito:', payload);
    return {
      userId: payload.sub,
      role: payload.role,
      clienteId: payload.clienteId,
      sucursalId: payload.sucursalId,
    };
  }
}