import { Controller, Post, Get, Param, UseGuards } from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@/common/decorators/userId.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('friendship')
export class FriendshipController {
  constructor(private readonly friendshipService: FriendshipService) { }

  /** Gửi lời mời kết bạn */
  @Post('add/:friendId')
  async sendRequest(
    @User('sub') userId: string,
    @Param('friendId') friendId: string,
  ) {
    return this.friendshipService.sendRequest(userId, friendId);
  }

  /** Chấp nhận lời mời kết bạn */
  @Post('accept/:friendId')
  async acceptRequest(
    @User('sub') userId: string,
    @Param('friendId') friendId: string,
  ) {
    return this.friendshipService.acceptRequest(userId, friendId);
  }

  /** Từ chối lời mời kết bạn */
  @Post('reject/:friendId')
  async rejectRequest(
    @User('sub') userId: string,
    @Param('friendId') friendId: string,
  ) {
    return this.friendshipService.rejectRequest(userId, friendId);
  }

  /** Hủy kết bạn */
  @Post('unfriend/:friendId')
  async unfriend(
    @User('sub') userId: string,
    @Param('friendId') friendId: string,
  ) {
    return this.friendshipService.unfriend(userId, friendId);
  }

  /**  Lấy danh sách bạn bè */
  @Get('list')
  async getFriends(@User('sub') userId: string) {
    console.log("Current userId:", userId);
    return this.friendshipService.getFriends(userId);
  }

  /**  Lấy danh sách lời mời đang chờ */
  @Get('requests')
  async getPending(@User('sub') userId: string) {
    return this.friendshipService.getPendingRequests(userId);
  }
}
