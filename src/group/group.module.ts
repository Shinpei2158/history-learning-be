import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { Group, GroupSchema } from './schemas/group.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupMember, GroupMemberSchema } from './schemas/group-member.schema';
import { User, UserSchema } from '@/users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Group.name, schema: GroupSchema },
      { name: GroupMember.name, schema: GroupMemberSchema },
      { name: User.name, schema: UserSchema }
    ]),
  ],
  controllers: [GroupController],
  providers: [GroupService],
})
export class GroupModule { }
