import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import WebSocket from 'ws'
import { Socket } from 'socket.io'
import { SocketService } from './socket.service'

@WebSocketGateway({ cors: true })
export class SocketGateway {
  constructor(private readonly SocketService: SocketService) {}

  // 供其它模块调用
  @WebSocketServer()
  server: Socket

  clientIdList: string[] = []

  handleConnection(client: any) {
    console.log(`${client.id} 连接成功`)
    this.clientIdList.push(client.id)
  }

  handleDisconnect(client: any) {
    console.log(`${client.id} 断开连接`)
    const index = this.clientIdList.findIndex(item => item === client.id)
    index !== -1 && this.clientIdList.splice(index, 1)
  }

  @SubscribeMessage('socketTest')
  socketTest(@MessageBody() data: any, @ConnectedSocket() client: WebSocket) {
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
