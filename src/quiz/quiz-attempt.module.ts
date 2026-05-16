import { Module } from '@nestjs/common';
import { QuizAttemptService } from './quiz-attempt.service';
import { QuizAttemptController } from './quiz-attempt.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { QuizAttempt, QuizAttemptSchema } from './schemas/quiz-attempt.schema';
import { Flashcard, FlashcardSchema } from '@/flashcard/schemas/flashcard.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: QuizAttempt.name, schema: QuizAttemptSchema },
      { name: Flashcard.name, schema: FlashcardSchema }
    ])
  ],
  controllers: [QuizAttemptController],
  providers: [QuizAttemptService],
})
export class QuizAttemptModule { }
