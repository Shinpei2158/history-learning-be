import { Module } from '@nestjs/common';
import { FlashcardService } from './flashcard.service';
import { FlashcardController } from './flashcard.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Flashcard, FlashcardSchema } from './schemas/flashcard.schema';
import { UserFlashcardProgress, UserFlashcardProgressSchema } from './schemas/user-flashcard-grogress.schema';
import { FlashcardLike, FlashcardLikeSchema } from './schemas/user-flashcard-like.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Flashcard.name, schema: FlashcardSchema },
      { name: UserFlashcardProgress.name, schema: UserFlashcardProgressSchema },
      { name: FlashcardLike.name, schema: FlashcardLikeSchema }]),
  ],
  controllers: [FlashcardController],
  providers: [FlashcardService],
  exports: [FlashcardService]
})
export class FlashcardModule { }
