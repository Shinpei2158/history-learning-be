import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './user.controller';
import { UserService } from './user.service';
import { User, UserSchema } from './schemas/user.schema';
import { UserItem, UserItemSchema } from './schemas/user-item.schema';
import { Avatar, AvatarSchema } from './schemas/avatar.schema';
import { Frame, FrameSchema } from './schemas/frame.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Avatar.name, schema: AvatarSchema },
      { name: Frame.name, schema: FrameSchema },
      { name: UserItem.name, schema: UserItemSchema }
    ]),
  ],
  controllers: [UsersController],
  providers: [UserService],
  exports: [UserService],
})
export class UsersModule { }