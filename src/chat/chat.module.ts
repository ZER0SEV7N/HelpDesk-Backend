import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { JwtStrategy } from 'src/auth/jwt.strategy';

@Module({
  imports: [JwtStrategy, RoleGuard],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}
