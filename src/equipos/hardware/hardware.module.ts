//src/hardware/hardware.module.ts
//Modulo para la gestion de hardware
//Importaciones necesarias:
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HardwareService } from './hardware.service';
import { HardwareController } from './hardware.controller';
import { Hardware } from 'src/entities/Hardware.entity';

//Definicion del modulo HardwareModule
@Module({
    imports: [TypeOrmModule.forFeature([Hardware])], // Importar entidades necesarias para el modulo
    controllers: [HardwareController],
    providers: [HardwareService],
    exports: [HardwareService], // Exportar el servicio para usarlo en otros modulos
})
export class HardwareModule {}
