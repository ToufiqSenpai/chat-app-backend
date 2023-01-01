import { OnModuleInit } from '@nestjs/common';
import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class ChatGateway implements OnModuleInit {
  @WebSocketServer()
  private server: Server

  public onModuleInit() {
    this.server.on('connection', socket => {

    })
  }

  @SubscribeMessage('message')
  public handleMessage(@MessageBody() message, payload: any) {
    console.log(message)
    this.server.emit('receive-message', "hai juga")
  }
}
