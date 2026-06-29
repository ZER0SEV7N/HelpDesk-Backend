//src/module/usuario/managers/employee-registration.manager.ts
//Manager para manejar la logica de negocio relacionada con el registro de empleados
//Funcionalidades:
//1. Registrar un nuevo empleado (Solo Cliente_Empresa)
//2. Reasignar un empleado a otra sucursal (Solo Cliente_Empresa)
import { Injectable, BadRequestException, Inject, NotFoundException } from '@nestjs/common';
import { NotificationGateway } from '@/common/websockets/notification.gateway';
import { RegisterEmployeeDto } from '../dto/register-employee.dto';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { EmailService } from '@/common/email/email.service';
import * as crypto from 'crypto';

@Injectable()
export class EmployeeRegistrationManager {

  //Prefijo para mantener orden en Redis y evitar colisiones de claves
  private readonly REDIS_PREFIX = 'pending_emp_reg:';
  private readonly TOKEN_TTL = 15 * 60; // 15 minutos en segundos

  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly notificationGateway: NotificationGateway,
    private readonly emailService: EmailService, // Servicio para enviar correos electrónicos
  ) {}

  //Metodo para iniciar el proceso de registro enviando el token por correo y abriendo el canal de WebSocket
  async initiateVerification(dto: RegisterEmployeeDto, userPayload: any) {
    const redisKey = `${this.REDIS_PREFIX}${dto.correo}`;

    //Generar un token aleatorio y establecer un tiempo de expiración
    const token = crypto.randomBytes(32).toString('hex');
    const sessionData = {
      dto,
      creatorId: userPayload.sub,
      token,
    };

    // Guardar en Redis aplicando TTL (Se autodestruye a los 15 minutos)
    await this.redis.set(redisKey, JSON.stringify(sessionData), 'EX', this.TOKEN_TTL);

    await this.emailService.sendEmployeeVerification(dto.correo, token);

    //Avisar inmediatamente a la UI del Administrador a través del Namespace de notificaciones
    this.notificationGateway.emitEmailVerificationStatus(userPayload.sub, {
      correo: dto.correo,
      verificado: false,
      status: 'PENDIENTE_VERIFICACION',
    });

    return {
      message: 'Código de verificación enviado al correo del empleado. Esperando confirmación en tiempo real.',
      expiraEn: '15 minutos',
    };
  }

  /**
   *Endpoint o hook de confirmación (Disparado cuando el empleado hace clic en su bandeja de entrada)
   */
  async confirmEmail(correo: string, token: string): Promise<RegisterEmployeeDto> {
    const redisKey = `${this.REDIS_PREFIX}${correo}`;
    const rawData = await this.redis.get(redisKey);

    //Si no existe en Redis, significa que nunca se envió o ya expiró por TTL
    if (!rawData) throw new BadRequestException('El proceso de verificación no existe o ha expirado.');
    
    //Parsear la sesión para validar el token
    const session = JSON.parse(rawData);

    if (session.token !== token) throw new BadRequestException('El token de verificación proporcionado es inválido.');
  
    //Avisar a la interfaz en tiempo real que el usuario completó la acción con éxito
    this.notificationGateway.emitEmailVerificationStatus(session.creatorId, {
      correo,
      verificado: true,
      status: 'APROBADO',
    });

    //Limpiar Redis inmediatamente al procesar la confirmación
    await this.redis.del(redisKey);

    //Retornar el DTO original para que el UsuarioAdminService lo persista de forma definitiva en MySQL
    return session.dto;
  }

  /**
   *Permitir modificar los datos o reajustar el correo antes de que se confirme
   */
  async updatePendingData(correoOriginal: string, nuevoDto: RegisterEmployeeDto, userPayload: any) {
    const oldRedisKey = `${this.REDIS_PREFIX}${correoOriginal}`;
    const exists = await this.redis.exists(oldRedisKey);

    //Si no existe, significa que nunca se envió o ya expiró por TTL
    if (!exists) throw new NotFoundException('No se encontró ninguna verificación pendiente con el correo indicado.');
    
    // Borramos el registro del correo anterior si el administrador decidió cambiarlo
    if (correoOriginal !== nuevoDto.correo) await this.redis.del(oldRedisKey);
    
    // Volvemos a disparar el flujo de inicialización con los datos actualizados y nuevo token
    return this.initiateVerification(nuevoDto, userPayload);
  }

  /**
   * Cancelar o remover un registro de verificación pendiente de forma manual
   */
  async cancelVerification(correo: string, userPayload: any) {
    const redisKey = `${this.REDIS_PREFIX}${correo}`;
    const rawData = await this.redis.get(redisKey);

    if (!rawData) throw new NotFoundException('La solicitud de verificación no existe.');

    const session = JSON.parse(rawData);
    if (session.creatorId !== userPayload.sub && userPayload.role !== 'ADMINISTRADOR') throw new BadRequestException('No posees autorización para cancelar esta solicitud de registro.');

    await this.redis.del(redisKey);

    this.notificationGateway.emitEmailVerificationStatus(session.creatorId, {
      correo,
      verificado: false,
      status: 'CANCELADO_MANUAL',
    });

    return { message: 'Solicitud de registro eliminada de la memoria transitoria con éxito.' };
  }
}