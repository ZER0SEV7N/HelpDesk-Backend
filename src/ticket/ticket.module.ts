//helpDesk-Backend/src/ticket/ticket.module.ts
//Modulo de tickets.
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { Tickets } from '../entities/Tickets.entity';
import { AuthModule } from '../modules/auth/auth.module';
import { Rol } from '@/entities/Rol.entity';
import { Equipos } from '@/entities/Equipos.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tickets, Rol, Equipos]), AuthModule],
  controllers: [TicketController],
  providers: [TicketService],
  exports: [TicketService],
})
export class TicketModule {}
