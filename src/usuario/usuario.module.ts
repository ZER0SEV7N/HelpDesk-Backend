//helpdesk-app/src/usuario/usuario.module.ts
//Modulo para manejar las funcionalidades relacionadas con los usuarios
import { Module } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { Rol } from 'src/entities/Rol.entity';
import { Usuario } from 'src/entities/Usuario.entity';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sucursales } from 'src/entities/Sucursales.entity';
import { Clientes } from 'src/entities/Clientes.entity';

@Module({
  controllers: [UsuarioController],
  providers: [UsuarioService],
  imports: [TypeOrmModule.forFeature([Usuario, Rol, Sucursales, Clientes]), AuthModule]
  
})
export class UsuarioModule {}
