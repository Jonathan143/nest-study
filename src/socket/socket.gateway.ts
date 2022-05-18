import { MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets'
import { SocketService } from './socket.service'
import { AuthService } from '@/auth/auth.service'

@WebSocketGateway()
export class SocketGateway {
  constructor(
    private readonly SocketService: SocketService,
    private readonly AuthService: AuthService,
  ) {}

  @SubscribeMessage('socketTest')
  socketTest(@MessageBody() data: any) {
    console.log(data)

    return {
      action: 'socketTest',
      data: {
        msg1: '测试1',
        msg2: '测试2',
      },
    }
  }
}
