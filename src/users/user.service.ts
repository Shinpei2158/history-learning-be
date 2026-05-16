import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserItem, UserItemDocument } from './schemas/user-item.schema';
import { Avatar, AvatarDocument } from './schemas/avatar.schema';
import { Frame, FrameDocument } from './schemas/frame.schema';

export interface OwnedItem {
  _id: Types.ObjectId;
  name: string;
  type: string;
  price?: number;
  owned: boolean;
}

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Avatar.name) private avatarModel: Model<AvatarDocument>,
    @InjectModel(Frame.name) private frameModel: Model<FrameDocument>,
    @InjectModel(UserItem.name) private userItemModel: Model<UserItemDocument>
  ) { }

  async create(
    createUserDto: CreateUserDto,
  ): Promise<Omit<User, 'password'> & { _id: Types.ObjectId }> {
    const { username, email, password } = createUserDto;

    const existingUser = await this.userModel.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      throw new ConflictException(
        'User with this email or username already exists',
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await createdUser.save();
    const { password: _, ...result } = savedUser.toObject();

    return result as Omit<User, 'password'> & { _id: Types.ObjectId };
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().select('-password -refreshToken').exec();
  }

  async findOne(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select('-password -refreshToken');

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async searchUser(username: string, currentUserId: string) {
    if (!username?.trim()) return [];

    const users = await this.userModel.find({
      username: { $regex: username, $options: 'i' },
      _id: { $ne: new Types.ObjectId(currentUserId) },
    })
      .populate([
        { path: 'avatar', select: 'name' },
        { path: 'frame', select: 'name' },
      ])
      .select('_id username avatar frame')
      .limit(10)
      .lean();

    return users.map(u => {
      const user = u as unknown as {
        _id: Types.ObjectId;
        username: string;
        avatar?: { name: string } | null;
        frame?: { name: string } | null;
      };

      return {
        id: user._id.toString(),
        username: user.username,
        avatar: user.avatar?.name || null,
        frame: user.frame?.name || null,
      };
    });

  }

  async getUserItems(userId: string): Promise<{ avatars: OwnedItem[]; frames: OwnedItem[] }> {
    const userItem = await this.userItemModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .lean();

    const [allAvatars, allFrames] = await Promise.all([
      this.avatarModel.find().select('name type price').lean(),
      this.frameModel.find().select('name type price').lean(),
    ]);

    const ownedAvatarIds = userItem?.avatars?.map((id) => id.toString()) || [];
    const ownedFrameIds = userItem?.frames?.map((id) => id.toString()) || [];

    const avatars = allAvatars.map((a) => ({
      ...a,
      owned: ownedAvatarIds.includes(a._id.toString()),
    }));

    const frames = allFrames.map((f) => ({
      ...f,
      owned: ownedFrameIds.includes(f._id.toString()),
    }));

    return { avatars, frames };
  }

  async updateUserAvatarFrame(
    userId: string,
    { avatarId, frameId }: { avatarId?: string; frameId?: string }
  ) {
    const updateData: any = {};
    if (avatarId) updateData.avatar = new Types.ObjectId(avatarId);
    if (frameId) updateData.frame = new Types.ObjectId(frameId);

    return this.userModel.findByIdAndUpdate(userId, updateData, { new: true }).lean();
  }

  async buyItem(
    userId: string,
    { itemId, type }: { itemId: string; type: 'avatar' | 'frame' },
  ) {
    // Lấy user
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('Không tìm thấy user');

    // Lấy hoặc tạo document UserItem (danh sách sở hữu)
    let userItem = await this.userItemModel.findOne({ userId: new Types.ObjectId(userId) });
    if (!userItem) {
      userItem = new this.userItemModel({
        userId,
        avatars: [],
        frames: [],
      });
    }

    // Lấy model item tương ứng
    const model = type === 'avatar' ? this.avatarModel : this.frameModel;
    const item = await model.findById(itemId);
    if (!item) throw new NotFoundException('Item không tồn tại');

    // Lấy danh sách sở hữu
    const ownedList =
      type === 'avatar' ? userItem.avatars : userItem.frames;

    // Kiểm tra đã sở hữu
    if (ownedList.some((id: Types.ObjectId) => id.equals(item._id))) {
      throw new BadRequestException('Bạn đã sở hữu item này!');
    }

    // Kiểm tra điểm
    if (user.point < item.price)
      throw new BadRequestException('Không đủ điểm để mua item này!');

    // Trừ điểm và thêm item
    user.point -= item.price;
    ownedList.push(item._id);

    // Lưu cả hai model
    await Promise.all([user.save(), userItem.save()]);

    return { message: 'Mua thành công', point: user.point };
  }




















  async findByEmail(email: string): Promise<UserDocument> {
    return this.userModel.findOne({ email });
  }

  async findByUsername(username: string): Promise<UserDocument> {
    return this.userModel.findOne({ username });
  }

  async findByEmailVerificationToken(token: string): Promise<UserDocument> {
    return this.userModel.findOne({ emailVerificationToken: token });
  }

  async findByPasswordResetToken(token: string) {
    return this.userModel.findOne({ passwordResetToken: token });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 12);
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .select('-password -refreshToken');

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('User not found');
    }
  }

  async updateRefreshToken(userId: string, refreshToken: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { refreshToken });
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await this.findByEmailVerificationToken(token);
    if (!user) {
      throw new NotFoundException('Invalid verification token');
    }

    await this.userModel.findByIdAndUpdate(user._id, {
      isEmailVerified: true,
      emailVerificationToken: null,
    });
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { lastLogin: new Date() });
  }

}