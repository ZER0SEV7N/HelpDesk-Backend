//helpdesk-app/src/auth/auth.module.ts
//Modulo de autenticacion
//----------------------------------------------------------
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from '../entities/Usuario.entity'; //Importa la entidad Usuario
import { Rol } from '../entities/Rol.entity'; //Importa la entidad Rol
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, Rol]),
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET')!, 
        signOptions: { 
          expiresIn: config.get<string>('JWT_EXPIRES_IN') || '1d' 
        } as any,
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard],
  exports: [JwtAuthGuard, AuthService],
})
export class AuthModule {}
