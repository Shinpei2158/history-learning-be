import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LessonLearn, LessonLearnSchema } from './schemas/lesson-learn.schema';
import { LessonLearnController } from './lesson-learn.controller';
import { LessonLearnService } from './lesson-learn.service';
import { AchievementEventModule } from '@/achievement/achievement-event.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LessonLearn.name, schema: LessonLearnSchema },
    ]),
    AchievementEventModule
  ],
  controllers: [LessonLearnController],
  providers: [LessonLearnService],
})
export class LessonLearnModule { }
