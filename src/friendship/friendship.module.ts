import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Friendship, FriendshipSchema } from './schemas/friendship.schema';
import { FriendshipService } from './friendship.service';
import { FriendshipController } from './friendship.controller';
import { PresenceGateway } from './gateway/presence.gateway';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AchievementEventModule } from '@/achievement/achievement-event.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Friendship.name, schema: FriendshipSchema }]),
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
    AchievementEventModule],
  providers: [FriendshipService, PresenceGateway],
  controllers: [FriendshipController],
  exports: [FriendshipService],
})
export class FriendshipModule { }
