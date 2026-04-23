//Helpdesk-app/src/database/database.module.ts
//Modulo para la configuracion de la base de datos
//Se utilizara la base de datos MySQL para el almacenamiento de los tickets, usuarios, roles, equipos y software
//Importaciones necesarias:
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisModule } from '@nestjs-modules/ioredis';
import { env } from 'process';
//Configuracion de la conexion a la base de datos
@Global()
@Module({
    //Importacion del modulo TypeOrmModule con la configuracion de la base de datos
    imports: [
        TypeOrmModule.forRoot({
            type: 'mysql', //Tipo de base de datos
            host: env.DB_HOST || 'localhost', //Host de la base de datos
            port: (parseInt(env.DB_PORT ?? '3306') || 3306), //Puerto de la base de datos
            username: env.DB_USERNAME || 'root', //Usuario de la base de datos
            password: env.DB_PASSWORD || '', //Contraseña de la base de datos
            database: env.DB_NAME || 'helpdesk_db', //Nombre de la base de datos
            //entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
            autoLoadEntities: true, //Carga automática de entidades
            synchronize: false, //Sincronización de la base de datos (solo en desarrollo)
        }),
        //Importacion de la base de datos MONGODB para el historial del chat
        MongooseModule.forRoot(env.MONGODB_URI || 'mongodb://localhost:27017/helpdesk_chat'),

        //Implementar Redis para el almacenamiento de los mensajes del chat en memoria, 
        //lo que permitirá una comunicación más rápida entre el cliente y el soporte técnico. 
        //Redis es una base de datos en memoria que se utiliza comúnmente para almacenar datos temporales y de alta velocidad, como los mensajes del chat. 
        //Al utilizar Redis, se puede mejorar significativamente la velocidad de entrega de los mensajes y reducir la latencia en la comunicación 
        //entre el cliente y el soporte técnico.
        RedisModule.forRoot({
            type: 'single',
            url: env.REDIS_URL || 'redis://localhost:6379',
        }),
    ],
    exports: [RedisModule],
})
export class DatabaseModule {}
