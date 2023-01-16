import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt/dist';
import { PrismaClient, User } from '@prisma/client';
import { SignupProps } from './dto';
import * as bcrypt from 'bcrypt'
import randomString from 'src/utils/random-string';
import { ResponseBody } from 'src/utils/response-body';

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
    return this.jwt.sign({ id: user.id, salt: randomString(32) }, {
      privateKey: process.env.REFRESH_TOKEN_SECRET
    })
  }

  public async accessToken(refreshToken: string) {
    try {
      const verifiedRefreshToken = this.jwt.verify(refreshToken, {
        secret: process.env.REFRESH_TOKEN_SECRET
      })
      const user = await this.prisma.user.findFirst({ where: { id: verifiedRefreshToken.id }})
      
      const accessToken = this.jwt.sign({
        id: user.id,
        salt: randomString(32)
      }, { secret: process.env.ACCESS_TOKEN_SECRET, expiresIn: '8s' })
  
      return {
        accessToken,
        tokenType: 'Bearer',
        expiresIn: 8,
        status: 200
      }
    } catch(error) {
      throw new UnauthorizedException(new ResponseBody({
        status: HttpStatus.UNAUTHORIZED
      }))
    }
  }

  public isLogin(refreshToken: string): boolean {
    try {
      const splittedToken = refreshToken.split(' ')

      if(splittedToken[0] != 'Bearer') {
        throw 'Invalid token type'
      }

      this.jwt.verify(splittedToken[1], {
        secret: process.env.REFRESH_TOKEN_SECRET
      })
      return true
    } catch (error) {
      return false
    }
  }
}
