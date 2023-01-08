import { BadRequestException, Controller, Get, HttpStatus, NotFoundException, Param, Query, UnprocessableEntityException } from '@nestjs/common';
import { Post, UseGuards, UseInterceptors, Req, UploadedFiles, Put } from '@nestjs/common/decorators';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { AccessTokenGuard } from 'src/token/accesstoken.guard';
import { FilesValidator } from 'src/utils/file-validator';
import { multerStorage } from 'src/utils/multer-storage';
import { ResponseBody } from 'src/utils/response-body';
import { UserService } from './user.service';

@Controller('user')
@UseGuards(new AccessTokenGuard())
export class UserController {
  constructor(private userService: UserService) {}

  @Get('search-user/:user')
  public async searchUser(@Param('user') userId: string, @Req() req: Request): Promise<ResponseBody> {
    const users = await this.userService.searchUser(userId)

    if(users.length == 0) throw new NotFoundException(new ResponseBody({
      status: HttpStatus.NOT_FOUND,
      message: 'Users not found'
    }))

    return new ResponseBody({
      status: HttpStatus.OK,
      data: users.filter(user => user.id != (req.user as any).id)
    })
  }

  @Put('change-avatar')
  @UseInterceptors(FilesInterceptor('avatar', 1, multerStorage('./assets/users/avatar')))
  public async changeAvatar(@UploadedFiles() files: Array<Express.Multer.File>, @Req() req: Request) {
    const filesValidator = new FilesValidator(files, {
      path: './assets/users/avatar',
      allowExt: ['jpg', 'jpeg', 'png'],
      maxSize: 10 * 1024 * 1024
    })
    const filesValidate = filesValidator.validate()

    if(!filesValidate.isValid) {
      filesValidator.deleteAllFiles()
      throw new UnprocessableEntityException(new ResponseBody({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: filesValidate.errors
      }))
    }

    await this.userService.changeAvatar(files[0].filename , (req.user as any).id)

    return new ResponseBody({ status: HttpStatus.CREATED })
  }

  @Get('add-friend/:toUserId')
  public async addFriend(@Param('toUserId') toUserId: string, @Req() req: Request): Promise<ResponseBody> {
    if(Number.isNaN(parseInt(toUserId))) throw new BadRequestException(new ResponseBody({
      status: HttpStatus.BAD_REQUEST,
      message: 'Not an uid'
    }))

    await this.userService.addFriend((req.user as any).id, toUserId)
    
    return new ResponseBody({
      status: HttpStatus.OK,
      message: 'Friend request has been sended'
    })
  }

  @Get('get-friend-request')
  public async getFriendRequest(@Req() req: Request) {
    const friendRequest = await this.userService.getFriendRequest((req.user as any).id)

    return new ResponseBody({
      status: HttpStatus.OK,
      data: friendRequest
    })
  }
}
