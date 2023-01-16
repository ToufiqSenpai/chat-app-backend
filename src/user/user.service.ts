import { ConflictException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client';
import * as fs from 'fs'
import { ResponseBody } from 'src/utils/response-body';
import uuid from 'src/utils/uuid';
import { MessageData } from './interfaces/MessageData';

@Injectable()
export class UserService {

  private prisma = new PrismaClient()

  public async searchUser(userId: string) {
    if (Number.isNaN(parseInt(userId))) {
      return await this.prisma.$queryRawUnsafe<User[]>(`SELECT * FROM User WHERE username LIKE '%${userId}%'`)
    } else {
      return await this.prisma.user.findMany({
        where: { id: parseInt(userId) }
      })
    }
  }

  public async changeAvatar(filename: string, userId: number): Promise<void> {
    // Check if avatar is already exist
    const user = await this.prisma.user.findFirst({ where: { id: userId } })
    if (user && user.avatar) {
      fs.unlinkSync(`./assets/users/avatar/${user.avatar}`)
    }

    // Update the avatar
    await this.prisma.user.update({
      where: { id: userId },
      data: { avatar: filename }
    })
  }

  public async addFriend(fromUser: number, toUser: string): Promise<void> {
    const userData = await this.prisma.user.findFirst({ where: { id: parseInt(toUser) }})
    let friendRequest = userData.friendRequest

    if((friendRequest as number[])?.includes(fromUser)) {
      throw new ConflictException(new ResponseBody({
        status: HttpStatus.CONFLICT,
        message: 'Friend request already sended'
      }))
    }
    
    if(!friendRequest) {
      friendRequest = [];
      (friendRequest as number[]).push(fromUser);
    } else {
      (friendRequest as number[]).push(fromUser);
    }

    await this.prisma.user.update({
      where: { id: parseInt(toUser) },
      data: { friendRequest }
    })    
  }

  public async getFriendRequest(id: number): Promise<object[]> {
    const requestId = await this.prisma.user.findFirst({ where: { id }})

    if(!requestId.friendRequest) {
      return []
    }

    const users = await this.prisma.user.findMany({
      where: { id: { in: (requestId.friendRequest as number) }}
    })

    return users.map(user => {
      return {
        id: user.id,
        username: user.username,
        avatar: user.avatar
      }
    })
  }

  public async acceptFriend(user1: number, user2: number, accept: boolean) {
    const user1Data = await this.prisma.user.findFirst({ where: { id: user1 }})
    const user2Data = await this.prisma.user.findFirst({ where: { id: user2 }})
    let friendId1 = user1Data.friendId
    let friendId2 = user2Data.friendId
    const chatId = uuid()
    
    if(accept) {
      if(!friendId1) {
        friendId1 = [];
        (friendId1 as string[]).push(chatId);
      } else {
        (friendId1 as string[]).push(chatId);
      }

      if(!friendId2) {
        friendId2 = [];
        (friendId2 as string[]).push(chatId);
      } else {
        (friendId2 as string[]).push(chatId);
      }

      await this.prisma.chat.create({ data: { chatId, chatUsernames: [user1Data.username, user2Data.username], messageData: [] }})
      await this.prisma.user.update({ where: { id: user1Data.id }, data: { friendId: friendId1 }})
      await this.prisma.user.update({ where: { id: user2Data.id }, data: { friendId: friendId2 }})
    } else {
      const newFriendReq = (user1Data.friendRequest as number[]).filter(req => req != user2Data.id)
      await this.prisma.user.update({ where: { id: user1Data.id }, data: { friendRequest: newFriendReq }})
    }
  }

  public async getUserData(uid: number): Promise<User> {
    return await this.prisma.user.findFirst({ where: { id: uid }})
  }

  public async getAllChats(uid: number) {
    const user = await this.prisma.user.findFirst({ where: { id: uid }})

    if(!user.friendId) return []

    const userChats = await this.prisma.chat.findMany({ where: { chatId: { in: user.friendId as string[] }}})

    return await Promise.all(userChats.map(async userChat => {
      const friendName = (userChat.chatUsernames as string[]).filter(username => username != user.username)[0]
      const friend = await this.prisma.user.findFirst({ where: { username: friendName }})
      delete userChat.chatUsernames, userChat.id

      return { 
        ...userChat, 
        friendMetadata: {
          id: friend.id,
          username: friend.username,
          avatar: friend.avatar
        }
      }
    }))
  }
}