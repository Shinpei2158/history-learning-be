import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Friendship, FriendshipDocument } from './schemas/friendship.schema';
import { FriendshipStatus } from '@/common/enums/friendship-status.enum';
import { User, UserDocument } from '@/users/schemas/user.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class FriendshipService {
  constructor(
    @InjectModel(Friendship.name)
    private readonly friendshipModel: Model<FriendshipDocument>,
    private readonly eventEmitter: EventEmitter2,
  ) { }

  /** Gửi lời mời kết bạn */
  async sendRequest(userId: string, friendId: string) {
    if (userId === friendId)
      throw new BadRequestException('Không thể kết bạn với chính mình');

    const userObjId = new Types.ObjectId(userId);
    const friendObjId = new Types.ObjectId(friendId);

    const existing = await this.friendshipModel.findOne({
      userId: userObjId,
      friendId: friendObjId,
    });

    if (existing)
      throw new BadRequestException('Đã gửi lời mời hoặc đã là bạn bè');

    const friendship = await this.friendshipModel.create({
      userId: userObjId,
      friendId: friendObjId,
      status: FriendshipStatus.PENDING,
    });

    return friendship;
  }

  /** Chấp nhận lời mời kết bạn */
  async acceptRequest(userId: string, friendId: string) {
    const userObjId = new Types.ObjectId(userId);
    const friendObjId = new Types.ObjectId(friendId);

    const request = await this.friendshipModel.findOne({
      userId: friendObjId, // người gửi
      friendId: userObjId, // người nhận
      status: FriendshipStatus.PENDING,
    });

    if (!request)
      throw new BadRequestException('Không tìm thấy lời mời kết bạn');

    // Cập nhật trạng thái
    request.status = FriendshipStatus.ACCEPTED;
    await request.save();

    // Tạo bản phản chiếu để đảm bảo 2 chiều
    await this.friendshipModel.create({
      userId: userObjId,
      friendId: friendObjId,
      status: FriendshipStatus.ACCEPTED,
    });

    this.eventEmitter.emit('friendship-accepted', {
      userA: userId, userB: friendId
    })

    return { message: 'Đã chấp nhận lời mời kết bạn' };
  }

  /** Từ chối lời mời */
  async rejectRequest(userId: string, friendId: string) {
    const userObjId = new Types.ObjectId(userId);
    const friendObjId = new Types.ObjectId(friendId);

    const request = await this.friendshipModel.findOneAndUpdate(
      {
        userId: friendObjId,
        friendId: userObjId,
        status: FriendshipStatus.PENDING,
      },
      { status: FriendshipStatus.REJECTED },
    );

    if (!request) throw new BadRequestException('Không tìm thấy lời mời');
    return { message: 'Đã từ chối lời mời' };
  }

  /** Hủy kết bạn */
  async unfriend(userId: string, friendId: string) {
    const userObjId = new Types.ObjectId(userId);
    const friendObjId = new Types.ObjectId(friendId);

    await this.friendshipModel.deleteMany({
      $or: [
        { userId: userObjId, friendId: friendObjId },
        { userId: friendObjId, friendId: userObjId },
      ],
    });

    //Emit
    this.eventEmitter.emit('friendship-removed', {
      userA: userId,
      userB: friendId,
    });

    return { message: 'Đã hủy kết bạn' };
  }

  /** Danh sách bạn bè */
  async getFriends(userId: string) {
    const userObjId = new Types.ObjectId(userId);

    const friendships = await this.friendshipModel
      .find({
        userId: userObjId,
        status: FriendshipStatus.ACCEPTED,
      })
      .populate({
        path: 'friendId',
        select: 'username avatar frame',
        populate: [
          { path: 'avatar', select: 'name' },
          { path: 'frame', select: 'name' },
        ],
      });

    return friendships.map((f) => {
      const friend = f.friendId as UserDocument & {
        avatar?: { name: string } | null;
        frame?: { name: string } | null;
      };

      return {
        id: friend._id.toString(),
        username: friend.username,
        avatar: friend.avatar?.name || null,
        frame: friend.frame?.name || null,
      };
    });

  }

  /** Lời mời kết bạn chờ xử lý */
  async getPendingRequests(userId: string) {
    const userObjId = new Types.ObjectId(userId);

    const requests = await this.friendshipModel
      .find({ friendId: userObjId, status: FriendshipStatus.PENDING })
      .populate({
        path: 'userId',
        select: 'username avatar frame',
        populate: [
          { path: 'avatar', select: 'name' },
          { path: 'frame', select: 'name' },
        ],
      });

    return requests.map((r) => {
      const user = r.userId as UserDocument & {
        avatar?: { name: string } | null;
        frame?: { name: string } | null;
      };

      return {
        _id: user._id.toString(),
        username: user.username,
        avatar: user.avatar?.name || null,
        frame: user.frame?.name || null,
      };
    });

  }
}
