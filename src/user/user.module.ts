import { Module } from '@nestjs/common';
import { AccessTokenStrategy } from 'src/token/accesstoken.strategy';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  providers: [UserService, AccessTokenStrategy]
})
export class UserModule {}
