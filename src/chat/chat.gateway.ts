import { OnModuleInit } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: process.env.CLIENT_URL })
export class ChatGateway implements OnModuleInit {
  @WebSocketServer()
  private server: Server

  private onlineUsers = []

  public onModuleInit() {
    this.server.on('connection', socket => {
      console.log(socket.id)
    })
  }

  @SubscribeMessage('login')
  public async login(@MessageBody() uid: number) {
    console.log(uid)
  }

  @SubscribeMessage('message')
  public handleMessage(@MessageBody() message, @ConnectedSocket() client: Socket) {
    console.log(client.id)
  
    this.server.emit('receive-message', "hai juga")
  }
}
