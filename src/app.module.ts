import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';

// Modules
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/user.module';
import { EmailModule } from './email/email.module';
import { FriendshipModule } from './friendship/friendship.module';
import { FlashcardModule } from './flashcard/flashcard.module';
import { LessonModule } from './lesson/lesson.module';
import { TestModule } from './test/test.module';
import { LessonLearnModule } from './lesson-learn/lesson-learn.module';
import { HistoricalFigureModule } from './historical-figure/historical-figure.module';
import { GroupModule } from './group/group.module';
import { ExamModule } from './exam/exam.module';
import { AchievementModule } from './achievement/achievement.module';
import { QuizAttemptModule } from './quiz/quiz-attempt.module';
import { StatisticModule } from './statistic/statistic.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI') || 'mongodb://localhost:27017/history-learning',
      }),
      inject: [ConfigService],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    EventEmitterModule.forRoot(),

    // Feature modules
    AuthModule,
    UsersModule,
    EmailModule,
    FriendshipModule,
    FlashcardModule,
    LessonModule,
    TestModule,
    LessonLearnModule,
    HistoricalFigureModule,
    GroupModule,
    ExamModule,
    AchievementModule,
    QuizAttemptModule,
    StatisticModule,
  ],
})
export class AppModule { }