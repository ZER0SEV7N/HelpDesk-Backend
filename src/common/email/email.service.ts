//src/common/email/email.service.ts
//Servicio para el manejo de envíos de correos electrónicos en la aplicación
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger('EmailService');

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 1. Envío de Correo para Validación de Empleado (Módulo de Usuarios)
   */
  async sendEmployeeVerification(correoDestino: string, token: string): Promise<void> {
    const appOrigin = this.configService.get<string>('HTTP_ORIGIN') || 'http://localhost:3000';
    const enlaceVerificacion = `${appOrigin}/verify-email?correo=${correoDestino}&token=${token}`;

    const htmlTemplate = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
        <h2 style="color: #f57c00;">¡Bienvenido al HelpDesk!</h2>
        <p>Se ha iniciado tu proceso de registro como empleado en la plataforma.</p>
        <p>Para confirmar tu cuenta y validar tu dirección de correo electrónico, por favor haz clic en el siguiente enlace operativo (válido por 15 minutos):</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${enlaceVerificacion}" style="background-color: #f57c00; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Verificar Correo Electrónico
          </a>
        </div>
        <p style="color: #666; font-size: 12px;">Si el botón no funciona, copia y pega esta URL en tu navegador: <br> ${enlaceVerificacion}</p>
      </div>
    `;

    await this.sendMail(correoDestino, 'Validación de Correo - Registro HelpDesk', htmlTemplate);
  }

  /**
   * 2. Envío de Correo para Recuperación de Contraseña (Módulo de Autenticación)
   */
  async sendPasswordRecovery(correoDestino: string, token: string): Promise<void> {
    const appOrigin = this.configService.get<string>('HTTP_ORIGIN') || 'http://localhost:3000';
    const enlaceRecuperacion = `${appOrigin}/reset-password?token=${token}`;

    const htmlTemplate = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
        <h2 style="color: #d32f2f;">Recuperación de Contraseña</h2>
        <p>Hemos recibido una solicitud para restablecer la contraseña de acceso a tu cuenta.</p>
        <p>Haz clic en el siguiente botón para configurar tus nuevas credenciales de seguridad de forma inmediata:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${enlaceRecuperacion}" style="background-color: #d32f2f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Restablecer Contraseña
          </a>
        </div>
        <p style="color: #ff9800; font-size: 13px;">⚠️ Si tú no has realizado esta solicitud, puedes ignorar este correo de forma segura; tu contraseña actual permanecerá intacta.</p>
      </div>
    `;

    await this.sendMail(correoDestino, 'Restablecer Contraseña - HelpDesk System', htmlTemplate);
  }

  /**
   * Método privado core encargado del transporte SMTP seguro
   */
  private async sendMail(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to,
        subject,
        html,
      });
      this.logger.log(`Correo enviado con éxito hacia: ${to} | Asunto: ${subject}`);
    } catch (error: any) {
      this.logger.error(`Error crítico al despachar correo a ${to}: ${error.message}`);
      throw new InternalServerErrorException('No se pudo enviar el correo de notificación del sistema.');
    }
  }
}