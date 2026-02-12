import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { TypeOrmModule } from '@nestjs/typeorm/dist';
import { ENTITIES_ARRAY } from 'src/all_entities';
import { Ticket } from 'src/entities/Tickets.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket]),
  ],
  controllers: [TicketController],
  providers: [TicketService],
})
export class TicketModule {}
