//src/common/filters/all-exceptions.filter.ts
//Manejador global de excepciones para capturar cualquier error no manejado y devolver una respuesta uniforme
import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger('all-exceptions-filter');

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        //Determinar el status
        const status = exception instanceof HttpException
            ? exception.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;

        //Construir la respuesta de error
        let message: string | object = 'Internal server error';

        if(exception instanceof HttpException) {
            const exceptionResponse = exception.getResponse();
            message = typeof exceptionResponse === 'object' && (exceptionResponse as any).message
                ? (exceptionResponse as any).message
                : exception.message;
        }else if (exception instanceof Error) {
            message = exception.message;
        }

        this.logger.error(
            `Http Status: ${status} - Method: ${request.method} - URL: ${request.url}`,
            exception instanceof Error ? exception.stack : JSON.stringify(exception),
        );

        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            // Si usas class-validator, 'message' puede ser un array de strings, lo manejamos dinámicamente:
            error: Array.isArray(message) ? message : [message], 
        });
    }
}