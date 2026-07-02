//src/module/usuario/managers/employee-registration.manager.ts
//Manager para manejar la logica de negocio relacionada con el registro de empleados
//Funcionalidades:
//1. Registrar un nuevo empleado (Solo Cliente_Empresa)
//2. Reasignar un empleado a otra sucursal (Solo Cliente_Empresa)
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { NotificationGateway } from '@/common/websockets/notification.gateway';
import { RegisterEmployeeDto } from '../dto/register-employee.dto';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { EmailService } from '@/common/email/email.service';
import { JwtPayload } from '@/common/guards/jwt-auth.guard';
import * as crypto from 'crypto';

@Injectable()
export class EmployeeRegistrationManager {
  private readonly REDIS_PREFIX = 'pending_emp_reg:';
  private readonly TOKEN_TTL = 15 * 60;

  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly notificationGateway: NotificationGateway,
    private readonly emailService: EmailService,
  ) {}

  async initiateVerification(
    dto: RegisterEmployeeDto,
    userPayload: JwtPayload,
  ) {
    const redisKey = `${this.REDIS_PREFIX}${dto.correo}`;

    const token = crypto.randomBytes(32).toString('hex');
    const sessionData = {
      dto,
      creatorId: userPayload.sub,
      token,
    };

    await this.redis.set(
      redisKey,
      JSON.stringify(sessionData),
      'EX',
      this.TOKEN_TTL,
    );

    await this.emailService.sendEmployeeVerification(dto.correo, token);

    this.notificationGateway.emitEmailVerificationStatus(userPayload.sub, {
      correo: dto.correo,
      verificado: false,
      status: 'PENDIENTE_VERIFICACION',
    });

    return {
      message:
        'Código de verificación enviado al correo del empleado. Esperando confirmación en tiempo real.',
      expiraEn: '15 minutos',
    };
  }

  async confirmEmail(
    correo: string,
    token: string,
  ): Promise<RegisterEmployeeDto> {
    const redisKey = `${this.REDIS_PREFIX}${correo}`;
    const rawData = await this.redis.get(redisKey);

    if (!rawData)
      throw new BadRequestException(
        'El proceso de verificación no existe o ha expirado.',
      );

    const session = JSON.parse(rawData) as {
      dto: RegisterEmployeeDto;
      creatorId: number;
      token: string;
    };

    if (session.token !== token)
      throw new BadRequestException(
        'El token de verificación proporcionado es inválido.',
      );

    this.notificationGateway.emitEmailVerificationStatus(session.creatorId, {
      correo,
      verificado: true,
      status: 'APROBADO',
    });

    await this.redis.del(redisKey);

    return session.dto;
  }

  async updatePendingData(
    correoOriginal: string,
    nuevoDto: RegisterEmployeeDto,
    userPayload: JwtPayload,
  ) {
    const oldRedisKey = `${this.REDIS_PREFIX}${correoOriginal}`;
    const exists = await this.redis.exists(oldRedisKey);

    if (!exists)
      throw new NotFoundException(
        'No se encontró ninguna verificación pendiente con el correo indicado.',
      );

    if (correoOriginal !== nuevoDto.correo) await this.redis.del(oldRedisKey);

    return this.initiateVerification(nuevoDto, userPayload);
  }

  async cancelVerification(correo: string, userPayload: JwtPayload) {
    const redisKey = `${this.REDIS_PREFIX}${correo}`;
    const rawData = await this.redis.get(redisKey);

    if (!rawData)
      throw new NotFoundException('La solicitud de verificación no existe.');

    const session = JSON.parse(rawData) as {
      creatorId: number;
    };

    if (
      session.creatorId !== userPayload.sub &&
      userPayload.role !== 'ADMINISTRADOR'
    )
      throw new BadRequestException(
        'No posees autorización para cancelar esta solicitud de registro.',
      );

    await this.redis.del(redisKey);

    this.notificationGateway.emitEmailVerificationStatus(session.creatorId, {
      correo,
      verificado: false,
      status: 'CANCELADO_MANUAL',
    });

    return {
      message:
        'Solicitud de registro eliminada de la memoria transitoria con éxito.',
    };
  }
}
