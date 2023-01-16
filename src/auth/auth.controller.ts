import { Controller, Post, Body, HttpStatus, HttpCode, Res, Get, Req, Headers } from '@nestjs/common';
import { LoginProps, SignupData, SignupProps } from './dto';
import { PrismaClient } from '@prisma/client';
import * as validate from 'class-validator-ext'
import { ResponseBody } from 'src/utils/response-body';
import { AuthService } from './auth.service';
import { NotAcceptableException, UnauthorizedException } from '@nestjs/common/exceptions';
import { LoginPipe } from './pipe/login.pipe';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  
  constructor(private authService: AuthService) {}

  @Post('signup')
  public async signup(@Body() body: SignupProps, @Res({ passthrough: true }) res: Response): Promise<ResponseBody> {
    const signupData: SignupData = new SignupData(body)
    const validateData = await validate.validateAndExtract(signupData)
    if(!validateData.isValid) {
      throw new NotAcceptableException(new ResponseBody({ errors: validateData.errors, status: HttpStatus.NOT_ACCEPTABLE }))
    }

    const refreshToken = this.authService.signup(body)
    res.cookie('refreshToken', refreshToken, {
      maxAge: 8764 * 60 * 60 * 60,
      httpOnly: true
    })

    return new ResponseBody({ status: HttpStatus.CREATED })
  }

  @Post('login')
  @HttpCode(202)
  public async login(@Body(new LoginPipe()) body: LoginProps, @Res({ passthrough: true }) res: Response): Promise<ResponseBody> {
    const refreshToken: string = await this.authService.login(body.email)
    res.cookie('refreshToken', refreshToken, {
      maxAge: 8764 * 60 * 60 * 60,
      httpOnly: true
    })

    return new ResponseBody({ status: HttpStatus.ACCEPTED })  
  }

  @Get('access-token')
  public async accessToken(@Req() req: Request) {
    const refreshToken = req.cookies.refreshToken
    const accessToken = await this.authService.accessToken(refreshToken)

    return accessToken
  }

  @Get('logout')
  @HttpCode(204)
  public logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refreshToken')
  }

  @Get('is-login')
  public isLogin(@Headers('Authorization') refreshToken: string) {
    const isVerified = this.authService.isLogin(refreshToken)

    if(!isVerified) {
      throw new UnauthorizedException(new ResponseBody({
        status: HttpStatus.UNAUTHORIZED
      }))
    }

    return new ResponseBody({
      status: HttpStatus.OK
    })
  }
}