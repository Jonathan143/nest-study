import { Module } from '@nestjs/common'
import { SocketService } from './socket.service'
import { SocketGateway } from './socket.gateway'
import { AuthModule } from '@/auth/auth.module'

@Module({
  imports: [AuthModule],
  providers: [SocketGateway, SocketService],
})
export class SocketModule {}
