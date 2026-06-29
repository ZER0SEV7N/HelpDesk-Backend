//helpdesk-app/src/modules/auth/auth.service.ts
//Servicio de autenticacion para el manejo de registro y login de usuarios
//----------------------------------------------------------
import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../../entities/Usuario.entity';
import { Rol } from '../../entities/Rol.entity';
import { RegisterDTO } from './dto/register-auth.dto';
import { LoginDTO } from './dto/login-auth.dto';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '@/common/email/email.service'; 

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario) private readonly usuariosRepo: Repository<Usuario>,
    @InjectRepository(Rol) private readonly rolRepo: Repository<Rol>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService, 
  ) {}

  /**
   * Registro de Usuario Ordinario
   */
  async register(dto: RegisterDTO) {
    const exists = await this.usuariosRepo.findOne({ where: { correo: dto.correo } });
    if (exists) throw new HttpException('El correo ya está registrado', HttpStatus.CONFLICT);

    const defaultRole = await this.rolRepo.findOne({ where: { nombre: 'CLIENTE_EMPLEADO' } });
    if (!defaultRole) throw new HttpException('Rol por defecto no encontrado', HttpStatus.CONFLICT);

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const newUser = this.usuariosRepo.create({
      nombre: dto.nombre,
      apellido: dto.apellido,
      correo: dto.correo,
      contraseña: hashedPassword,
      telefono: dto.telefono,
      rol: defaultRole,
      is_active: true,
    });

    return await this.usuariosRepo.save(newUser);
  }

  /**
   * Login de Usuario con retorno de credenciales estructuradas
   */
  async login(dto: LoginDTO) {
    const user = await this.usuariosRepo.findOne({
      where: { correo: dto.correo },
      relations: ['rol'],
    });

    if (!user || !user.is_active) throw new UnauthorizedException('Credenciales incorrectas o cuenta inactiva');

    const isPasswordValid = await bcrypt.compare(dto.password, user.contraseña);
    if (!isPasswordValid) throw new UnauthorizedException('Credenciales incorrectas');

    const payload = {
      sub: user.id_usuario,
      role: user.rol.nombre,
      clienteId: user.id_cliente,
      sucursalId: user.id_sucursal,
    };

    const token = this.jwtService.sign(payload);
    return { user, role: user.rol.nombre, token };
  }

  /**
   * Solicitar recuperación de contraseña (Usa el EmailService global)
   */
  async recoverPassword(correo: string) {
    const user = await this.usuariosRepo.findOne({ where: { correo } });
    if (!user) throw new HttpException('Correo no registrado', HttpStatus.NOT_FOUND);

    //Generar un token específico de recuperación usando la clave secreta del ConfigService
    const resetToken = this.jwtService.sign(
      { sub: user.id_usuario },
      { 
        expiresIn: '30m', 
        secret: this.configService.get<string>('JWT_RESET_SECRET') || 'resetKeyDefault' 
      },
    );

    //Enviar correo de recuperación usando el EmailService global
    await this.emailService.sendPasswordRecovery(user.correo, resetToken);

    return { message: 'Correo de restablecimiento enviado exitosamente' };
  }

  /**
   * Confirmar el restablecimiento de contraseña
   */
  async resetPassword(token: string, nuevaContraseña: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_RESET_SECRET') || 'resetKeyDefault',
      });

      const hashPassword = await bcrypt.hash(nuevaContraseña, 10);
      await this.usuariosRepo.update(
        { id_usuario: payload.sub },
        { contraseña: hashPassword },
      );

      return { message: 'Contraseña restablecida exitosamente' };
    } catch (error) {
      throw new HttpException('Token inválido o expirado', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Utilidad de verificación del Token JWT
   */
  async verifyToken(token: string) {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
    } catch (error) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}