//helpdesk-backend/src/files/files.controller.ts
//Controladora encargada de manejar las rutas relacionadas con la gestión de archivos,
//como subir archivos adjuntos a los tickets.
import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { diskStorage } from 'multer';
import { extname, resolve, sep } from 'path';
import { createReadStream, statSync } from 'fs';
import { join } from 'path';
import type { Response } from 'express';
import { randomInt } from 'crypto';

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];
const UPLOADS_DIR = resolve(join(process.cwd(), 'uploads'));

@Controller('files')
export class FilesController {
  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads'),
      filename: (req, file, cb) => {
        const ext = extname(file.originalname).toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
          cb(new BadRequestException('Solo se permiten imágenes (JPG, PNG, WEBP) o PDFs') as any, false as any);
          return;
        }
        const uniqueSuffix =
          Date.now() + '-' + randomInt(0, 1e9);
        cb(null, `chat-${uniqueSuffix}${ext}`);
      },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        const allowedTypes = [
          'image/jpeg',
          'image/png',
          'image/jpg',
          'image/webp',
          'application/pdf',
        ];
        if (!allowedTypes.includes(file.mimetype))
          return cb(
            new BadRequestException(
              'Solo se permiten imágenes (JPG, PNG, WEBP) o PDFs',
            ),
            false,
          );
        cb(null, true);
      },
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file)
      throw new BadRequestException(
        'Archivo no proporcionado o formato no permitido',
      );

    const host = process.env.API_URL || 'http://localhost:3000';
    const fileUrl = `${host}/files/${file.filename}`;

    const isPDF = file.mimetype === 'application/pdf';

    return {
      message: 'Archivo subido con éxito',
      url_archivo: fileUrl,
      tipo: isPDF ? 'DOCUMENTO' : 'IMAGEN',
      nombreOriginal: file.originalname,
    };
  }

  @Get(':filename')
  @UseGuards(JwtAuthGuard)
  async serveFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = resolve(UPLOADS_DIR, filename);
    if (!filePath.startsWith(UPLOADS_DIR + sep)) {
      throw new ForbiddenException('Access denied');
    }
    try {
      const stats = statSync(filePath);
      const stream = createReadStream(filePath);
      stream.pipe(res);
    } catch {
      throw new NotFoundException('Archivo no encontrado');
    }
  }
}
