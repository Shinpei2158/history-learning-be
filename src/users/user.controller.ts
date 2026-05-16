import {
  Controller,
  Get,
  UseGuards,
  Query,
  Patch,
  Body,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@/common/decorators/userId.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) { }

  @Get('search')
  async searchUser(@Query('username') username: string, @User('sub') userId: string,) {
    return this.userService.searchUser(username, userId);
  }

  @Get('item')
  async getUserItem(@User('sub') userId: string) {
    return this.userService.getUserItems(userId)
  }

  @Patch('item')
  async updateUserItem(
    @User('sub') userId: string,
    @Body() body: { avatarId?: string; frameId?: string }
  ) {
    return this.userService.updateUserAvatarFrame(userId, body);
  }

  @Patch('buy-item')
  async buyItem(@User('sub') userId: string, @Body() body: { itemId: string; type: 'avatar' | 'frame' }) {
    return this.userService.buyItem(userId, body);
  }

}