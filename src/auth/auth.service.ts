import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt/dist';
import { PrismaClient, User } from '@prisma/client';
import { SignupProps } from './dto';
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
  constructor(private jwt: JwtService) {}

  private readonly prisma: PrismaClient = new PrismaClient()

  public async signup(data: SignupProps): Promise<void> {
    const hashedPassword = bcrypt.hashSync(data.password, bcrypt.genSaltSync(10))

    await this.prisma.user.create({
      data: { username: data.username, email: data.email, password: hashedPassword}
    })
  }

  public async login(email: string): Promise<string> {
    const user: User = await this.prisma.user.findFirst({ where: { email }})
    const refreshToken: string = this.jwt.sign({ id: user.id }, {
      privateKey: process.env.REFRESH_TOKEN_SECRET
    })

    return refreshToken
  }
}
