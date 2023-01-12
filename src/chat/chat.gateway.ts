import { OnModuleInit } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { PrismaClient } from '@prisma/client';
import { Server, Socket } from 'socket.io';
import { OnlineUsers } from './interfaces';
import { MessageData } from './interfaces/MessageData';
import { SendMessageBody } from './interfaces/SendMessageBody';

@WebSocketGateway({ cors: process.env.CLIENT_URL })
export class ChatGateway implements OnModuleInit {
  @WebSocketServer()
  private server: Server

  private prisma: PrismaClient = new PrismaClient()

  private onlineUsers: OnlineUsers[] = []

  public onModuleInit() {
    this.server.on('connection', socket => {
      console.log(socket.id)
    })
  }

  @SubscribeMessage('login')
  public async login(@MessageBody() id: number, @ConnectedSocket() client: Socket) {
    this.onlineUsers.push({ id, connectionId: client.id })
  }

  @SubscribeMessage('send-message')
  public async handleMessage(@MessageBody() message: SendMessageBody, @ConnectedSocket() client: Socket) {
    const recipientConnectionId = this.onlineUsers.filter(users => users.id == message.recipientUid)[0]
    
    if(recipientConnectionId) {
      this.server.to(recipientConnectionId.connectionId).emit('receive-message', {
        text: message.text,
        myMessage: false
      })
    }

    const currentChat = await this.prisma.chat.findFirst({ where: { chatId: message.friendId }});

    (currentChat.messageData as unknown[]).push({
      text: message.text,
      authorId: message.authorId,
      isRead: false 
    })

    await this.prisma.chat.update({
      where: { id: currentChat.id },
      data: { messageData: currentChat.messageData}
    })
  }
}
