import { ArgumentMetadata, Injectable, PipeTransform, HttpStatus } from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client';
import { LoginProps } from '../dto';
import * as bcrypt from 'bcrypt'
import { ResponseBody } from 'src/utils/response-body';
import { ForbiddenException } from '@nestjs/common/exceptions';

@Injectable()
export class LoginPipe implements PipeTransform {
  private readonly prisma: PrismaClient = new PrismaClient()

  public async transform(value: LoginProps, metadata: ArgumentMetadata): Promise<LoginProps> {
    const user: User = await this.prisma.user.findFirst({ where: { email: value.email }})
    const isPasswordMatched: boolean = bcrypt.compareSync(value.password ?? '', user?.password ?? '')

    if(!user || !isPasswordMatched) throw new ForbiddenException(
      new ResponseBody({ status: HttpStatus.FORBIDDEN })
    )

    return value
  }
}
