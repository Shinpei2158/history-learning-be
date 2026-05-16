import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Achievement, AchievementSchema } from "./schemas/achievement.schema";
import { StudentAchievement, StudentAchievementSchema } from "./schemas/student-achivement.schema";
import { AchievementEventListener } from "./events/achievement.listener";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Achievement.name, schema: AchievementSchema },
            { name: StudentAchievement.name, schema: StudentAchievementSchema },
        ]),
    ],
    providers: [AchievementEventListener],
    exports: [AchievementEventListener],
})
export class AchievementEventModule { }
