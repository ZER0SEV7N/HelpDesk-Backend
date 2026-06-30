//helpdesk-app/src/auth/auth.module.ts
//Modulo de autenticacion
//----------------------------------------------------------
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from '../../entities/Usuario.entity'; //Importa la entidad Usuario
import { Rol } from '../../entities/Rol.entity'; //Importa la entidad Rol
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { StringValue } from 'ms';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, Rol]),
    ConfigModule,
    JwtModule.registerAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    const secretKey = config.get<string>('JWT_SECRET') || process.env.JWT_SECRET; 
    const expiresIn = (config.get<StringValue>('JWT_EXPIRES_IN') || '1d') as StringValue;
    
    if (!secretKey) console.warn('Alerta: JWT_SECRET no se detectó en ConfigService ni en process.env');

    return {
      secret: secretKey || 'ClaveSeguraAyudaDeRespaldoHelpdesk123!',
      signOptions: {
        expiresIn,
      },
    };
  },
}),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard],
  exports: [JwtAuthGuard, AuthService, JwtModule], // Exportamos JwtModule por si otros guards lo necesitan
})
export class AuthModule {}