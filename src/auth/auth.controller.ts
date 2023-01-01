import { Controller, Post, Body, HttpStatus, HttpCode, Res } from '@nestjs/common';
import { LoginProps, SignupData, SignupProps } from './dto';
import { PrismaClient } from '@prisma/client';
import * as validate from 'class-validator-ext'
import { ResponseBody } from 'src/utils/response-body';
import { AuthService } from './auth.service';
import { NotAcceptableException } from '@nestjs/common/exceptions';
import { LoginPipe } from './pipe/login.pipe';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  private readonly prisma: PrismaClient = new PrismaClient()

  constructor(private authService: AuthService) {}

  @Post('signup')
  public async signup(@Body() body: SignupProps): Promise<ResponseBody> {
    const signupData: SignupData = new SignupData(body)
    const validateData = await validate.validateAndExtract(signupData)

    if(!validateData.isValid) {
      throw new NotAcceptableException(new ResponseBody({ errors: validateData.errors, status: HttpStatus.NOT_ACCEPTABLE }))
    }
 
    await this.authService.signup(body)

    return new ResponseBody({ status: HttpStatus.CREATED })
  }

  @Post('login')
  @HttpCode(202)
  public async login(@Body(new LoginPipe()) body: LoginProps, @Res({ passthrough: true }) res: Response): Promise<ResponseBody> {
    const refreshToken: string = await this.authService.login(body.email)
    res.cookie('refreshToken', refreshToken, {
      maxAge: 8764 * 60 * 60,
      httpOnly: true
    })

    return new ResponseBody({ status: HttpStatus.ACCEPTED })  
  }
}