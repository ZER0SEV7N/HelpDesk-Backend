import { Injectable } from '@nestjs/common';
import { CsvProcessorUtil } from '@/common/bulk-upload/csv-processor.util';
import { RegisterEmployeeDto } from '../dto/register-employee.dto';
import { RegisterEmployeeUseCase } from './register-employee.use-case';

@Injectable()
export class RegisterBulkEmployeesUseCase {
    constructor(
        private readonly registerEmployeeUseCase: RegisterEmployeeUseCase,
        private readonly csvProcessor: CsvProcessorUtil,
    ) {}

    async execute(fileBuffer: Buffer, userPayload: any) {
        const requiredHeaders = ['nombre', 'apellido', 'correo', 'telefono', 'contraseña', 'rolNombre', 'id_sucursal'];

        const records = await this.csvProcessor.parseCsv<RegisterEmployeeDto>(fileBuffer, requiredHeaders);
        const summary: {
            exitosos: number;
            fallidos: number;
            errores: Array<{ correo: string; motivo: string }>;
        } = { exitosos: 0, fallidos: 0, errores: [] };

        await Promise.all(
            records.map(async (record) => {
                try {
                    await this.registerEmployeeUseCase.execute(record, userPayload);
                    summary.exitosos++;
                } catch (err: any) {
                    summary.fallidos++;
                    summary.errores.push({ correo: record.password, motivo: err.message });
                }
            }),
        );

        return { message: 'Procesamiento de carga masiva finalizado', summary };
    }
}
