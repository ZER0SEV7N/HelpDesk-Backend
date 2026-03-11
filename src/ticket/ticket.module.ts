import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { Tickets } from '../entities/Tickets.entity';
import { AuthModule } from '../auth/auth.module';
import { entities } from 'src/all_entity';

@Module({
  imports: [TypeOrmModule.forFeature(entities), AuthModule],
  controllers: [TicketController],
  providers: [TicketService],
})
export class TicketModule {}
