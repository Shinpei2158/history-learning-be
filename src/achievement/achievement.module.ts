import { Module } from '@nestjs/common';
import { AchievementService } from './achievement.service';
import { AchievementController } from './achievement.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Achievement, AchievementSchema } from './schemas/achievement.schema';
import { StudentAchievement, StudentAchievementSchema } from './schemas/student-achivement.schema';
import { AchievementCondition, AchievementConditionSchema } from './schemas/achievement-condition.schema';
import { User, UserSchema } from '@/users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AchievementCondition.name, schema: AchievementConditionSchema },
      { name: Achievement.name, schema: AchievementSchema },
      { name: StudentAchievement.name, schema: StudentAchievementSchema },
      { name: User.name, schema: UserSchema }
    ]),
  ],
  controllers: [AchievementController],
  providers: [AchievementService],
})
export class AchievementModule { }
