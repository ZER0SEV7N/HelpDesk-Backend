//Helpdesk-app/src/database/database.module.ts
//Modulo para la configuracion de la base de datos
//Se utilizara la base de datos MySQL para el almacenamiento de los tickets, usuarios, roles, equipos y software
//Importaciones necesarias:
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

//Configuracion de la conexion a la base de datos
@Module({
    //Importacion del modulo TypeOrmModule con la configuracion de la base de datos
    imports: [
        TypeOrmModule.forRoot({
            type: 'mysql', //Tipo de base de datos
            host: 'localhost', //Host de la base de datos
            port: 3306, //Puerto de la base de datos
            username: 'root', //Usuario de la base de datos
            password: '', //Contraseña de la base de datos
            database: 'helpdesk_db', //Nombre de la base de datos
            autoLoadEntities: true, //Carga automática de entidades
            synchronize: false, //Sincronización de la base de datos (solo en desarrollo)
        }),
    ],
})
export class DatabaseModule {}
