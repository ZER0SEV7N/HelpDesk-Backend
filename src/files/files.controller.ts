//helpdesk-backend/src/files/files.controller.ts
//Controladora encargada de manejar las rutas relacionadas con la gestión de archivos, 
//como subir archivos adjuntos a los tickets.
import { Controller, Post, UseGuards, UseInterceptors, UploadedFile, BadRequestException, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { env } from 'process';

@Controller('files')
@UseGuards(JwtAuthGuard) //Protege las rutas de este controlador con autenticación JWT
export class FilesController {

    //Configuración para almacenar los archivos subidos en el sistema de archivos local
    @Post('upload')
    @UseInterceptors(FileInterceptor('file', { 
        //Configurar el guardado local
        storage: diskStorage({
            destination: env.FILE_UPLOAD_PATH || './uploads',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = extname(file.originalname);
                cb(null, `chat-${uniqueSuffix}${ext}`);
            }
        }),

        //Limitar el tamaño del archivo a 5MB
        limits: { fileSize: 5 * 1024 * 1024 },
        //Filtrar los tipos de archivos permitidos
        fileFilter: (req, file, cb) => {
            const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf'];
            
            //Validar el tipo de archivo, solo se permiten imágenes (JPG, PNG, WEBP) o PDFs
            if (!allowedTypes.includes(file.mimetype)) 
                return cb(new BadRequestException('Solo se permiten imágenes (JPG, PNG, WEBP) o PDFs'), false);
            
            
            cb(null, true);
        }
    }))
   
    //Funcion para manejar la subida de archivos, valida el archivo y devuelve la URL de acceso al mismo
    uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req: any) { 
        if (!file) throw new BadRequestException('Archivo no proporcionado o formato no permitido');

        //Construir la URL de acceso al archivo subido (asumiendo que el servidor sirve los archivos desde /uploads)
        const host = env.API_URL || 'http://localhost:3000';
        const fileUrl = `${host}/uploads/${file.filename}`;

        
        const isPDF = file.mimetype === 'application/pdf';

        return {
            message: 'Archivo subido con éxito',
            url_archivo: fileUrl,
            tipo: isPDF ? 'DOCUMENTO' : 'IMAGEN',
            nombreOriginal: file.originalname
        };
    }
}
