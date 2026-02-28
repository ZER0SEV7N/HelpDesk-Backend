//src/auth/jwt.strategy.ts
//Modulo Encargado de la estrategia JWT para autenticacion
//----------------------------------------------------------
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'Token_Secreto',
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, role: payload.role };
  }
}