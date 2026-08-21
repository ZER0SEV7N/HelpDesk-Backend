import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';

describe('EmailService', () => {
  let service: EmailService;
  let mailerService: MailerService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    mailerService = module.get<MailerService>(MailerService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  it('debería enviar correo de verificación de empleado', async () => {
    jest.spyOn(mailerService, 'sendMail').mockResolvedValue(undefined as any);
    jest.spyOn(configService, 'get').mockReturnValue('http://localhost:3000');

    await expect(
      service.sendEmployeeVerification('test@example.com', 'token123'),
    ).resolves.toBeUndefined();
    expect(mailerService.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'test@example.com',
        subject: 'Validación de Correo - Registro HelpDesk',
      }),
    );
  });

  it('debería enviar correo de recuperación de contraseña', async () => {
    jest.spyOn(mailerService, 'sendMail').mockResolvedValue(undefined as any);
    jest.spyOn(configService, 'get').mockReturnValue('http://localhost:3000');

    await expect(
      service.sendPasswordRecovery('test@example.com', 'token123'),
    ).resolves.toBeUndefined();
    expect(mailerService.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'test@example.com',
        subject: 'Restablecer Contraseña - HelpDesk System',
      }),
    );
  });

  it('debería lanzar InternalServerErrorException si falla el envío', async () => {
    jest.spyOn(mailerService, 'sendMail').mockRejectedValue(new Error('SMTP error'));
    jest.spyOn(configService, 'get').mockReturnValue('http://localhost:3000');

    await expect(
      service.sendPasswordRecovery('test@example.com', 'token123'),
    ).rejects.toThrow(InternalServerErrorException);
  });
});
