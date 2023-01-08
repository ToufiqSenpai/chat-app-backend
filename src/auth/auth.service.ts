import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt/dist';
import { PrismaClient, User } from '@prisma/client';
import { SignupProps } from './dto';
import * as bcrypt from 'bcrypt'
import randomString from 'src/utils/random-string';

@Injectable()
export class AuthService {
  constructor(private jwt: JwtService) { }

  private readonly prisma: PrismaClient = new PrismaClient()

  public async signup(data: SignupProps): Promise<string> {
    const hashedPassword = bcrypt.hashSync(data.password, bcrypt.genSaltSync(10))

    const createUser = await this.prisma.user.create({
      data: { username: data.username, email: data.email, password: hashedPassword }
    })

    return this.jwt.sign({ id: createUser.id, salt: randomString(32) }, {
      privateKey: process.env.REFRESH_TOKEN_SECRET
    })
  }

  public async login(email: string): Promise<string> {
    const user: User = await this.prisma.user.findFirst({ where: { email } })
    const refreshToken: string = this.jwt.sign({ id: user.id, salt: randomString(32) }, {
      privateKey: process.env.REFRESH_TOKEN_SECRET
    })

    await this.prisma.user.update({
      where: { email },
      data: { refreshToken }
    })

    return refreshToken
  }

  public async accessToken(id: number) {

    const accessToken = this.jwt.sign({
      id,
      salt: randomString(32)
    }, { secret: process.env.ACCESS_TOKEN_SECRET, expiresIn: '1hr' })

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: 8,
      status: 200
    }
  }
}
