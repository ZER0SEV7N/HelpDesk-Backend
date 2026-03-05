import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../schemas/user.schema';
import { Rol, RolDocument } from '../schemas/rol.schema';
import { RegisterDTO } from './dto/register.auth.dto';
import { LoginDTO } from './dto/login.auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Rol.name) private rolModel: Model<RolDocument>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDTO) {
    const exists = await this.userModel.findOne({ correo: dto.correo }).exec();
    if (exists) {
      throw new HttpException('El correo ya está registrado', HttpStatus.CONFLICT);
    }

    let defaultRole = await this.rolModel.findOne({ nombre: 'TRABAJADOR' }).exec();
    if (!defaultRole) {
      defaultRole = await this.rolModel.create({ nombre: 'TRABAJADOR' });
    }

    const hashedPassword = await bcrypt.hash(dto.contrasena, 10);
    const newUser = await this.userModel.create({
      nombre: dto.nombre,
      apellido: dto.apellido,
      correo: dto.correo,
      contrasena: hashedPassword,
      telefono: dto.telefono,
      rol: defaultRole._id,
      is_active: true,
    });

    const userWithRol = await this.userModel
      .findById(newUser._id)
      .populate('rol')
      .select('-contrasena')
      .lean()
      .exec();
    return userWithRol;
  }

  async login(dto: LoginDTO): Promise<{ user: any; role: string; token: string }> {
    const user = await this.userModel
      .findOne({ correo: dto.correo })
      .populate('rol')
      .exec();

    if (!user || !user.is_active) {
      throw new UnauthorizedException('Correo incorrecto');
    }

    const isPasswordValid = await bcrypt.compare(dto.contrasena, user.contrasena);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    const rolNombre = (user.rol as any)?.nombre ?? 'TRABAJADOR';
    const payload = { sub: user._id.toString(), role: rolNombre };
    const token = this.jwtService.sign(payload);

    const userObj = user.toObject ? user.toObject() : user;
    delete (userObj as any).contrasena;
    return { user: { ...userObj, id_usuario: user._id.toString() }, role: rolNombre, token };
  }
}
