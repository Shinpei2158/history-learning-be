import { Module } from '@nestjs/common';
import { StatisticService } from './statistic.service';
import { StatisticController } from './statistic.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { QuizAttempt, QuizAttemptSchema } from '@/quiz/schemas/quiz-attempt.schema';
import { LessonLearn, LessonLearnSchema } from '@/lesson-learn/schemas/lesson-learn.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: QuizAttempt.name, schema: QuizAttemptSchema },
      { name: LessonLearn.name, schema: LessonLearnSchema }
    ])
  ],
  controllers: [StatisticController],
  providers: [StatisticService],
})
export class StatisticModule { }
