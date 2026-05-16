import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '@/users/user.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { EmailModule } from '../email/email.module';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '@/users/schemas/user.schema';
import { Achievement, AchievementSchema } from '@/achievement/schemas/achievement.schema';
import { StudentAchievement, StudentAchievementSchema } from '@/achievement/schemas/student-achivement.schema';
import { Avatar, AvatarSchema } from '@/users/schemas/avatar.schema';
import { Frame, FrameSchema } from '@/users/schemas/frame.schema';
import { UserItem, UserItemSchema } from '@/users/schemas/user-item.schema';

@Module({
  imports: [
    UsersModule,
    EmailModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_ACCESS_EXPIRES_IN', '15m')
        },
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Achievement.name, schema: AchievementSchema },
      { name: StudentAchievement.name, schema: StudentAchievementSchema },
      { name: Avatar.name, schema: AvatarSchema },
      { name: Frame.name, schema: FrameSchema },
      { name: UserItem.name, schema: UserItemSchema }
    ]),

  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule { }