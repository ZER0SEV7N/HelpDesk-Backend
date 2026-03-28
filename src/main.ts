//src/main.ts
//Punto de entrada de la aplicacion NestJS
//Importaciones necesarias:
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

//Funcion principal para iniciar la aplicacion
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //Habilitar CORS para permitir solicitudes desde el frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:7012',
    credentials: true, //Permite enviar cookies en solicitudes cross-origin
  });

  //Habilitar cookieParser para manejar cookies en las solicitudes
  app.use(cookieParser());

  //Activar ValidationPipe globalmente para validacion de DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, //Eliminar propiedades no definidas en el DTO
    forbidNonWhitelisted: true, //Lanzar error si hay propiedades no definidas
  }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
