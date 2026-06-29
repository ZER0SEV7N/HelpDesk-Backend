//src/common/bulk-upload/csv-processor.util.ts
//Utilidad para procesar archivos CSV en operaciones de carga masiva
//Funcionalidades:
//1. Validar estructura del CSV
//2. Mapear datos del CSV a entidades de la base de datos
//3. Manejar errores y reportes de carga masiva
import { Injectable, BadRequestException } from '@nestjs/common';
import { Readable } from 'stream';
import { parse } from 'csv-parse';

@Injectable()
export class CsvProcessorUtil {
    async parseCsv<T>(fileBuffer: Buffer, requiredHeaders: string[]): Promise<T[]> {
        return new Promise((resolve, reject) => {
            const results: T[] = [];
            const stream = Readable.from(fileBuffer);

            //Validar estructura del CSV
            stream
                .pipe(parse({ columns: true, skip_empty_lines: true, trim: true }))
                .on('data', (data) => {
                    //Validar que todas las columnas requeridas estén presentes
                    const keys = Object.keys(data);
                    const hasAllHeaders = requiredHeaders.every(header => keys.includes(header));
                    //Si falta alguna columna requerida, se rechaza la promesa con un error
                    if (!hasAllHeaders) reject(new BadRequestException('El archivo CSV no contiene todas las columnas requeridas'));
                    results.push(data as T);
                })
                .on('end', () => resolve(results))
                .on('error', (err) => reject(err));
        })
    }
}