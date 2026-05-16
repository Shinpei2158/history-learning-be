import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreateQuizAttemptDto } from './dto/create-quiz-attempt.dto';
import { Flashcard } from '@/flashcard/schemas/flashcard.schema';
import { QuizAttempt, QuizAttemptDocument } from './schemas/quiz-attempt.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';


@Injectable()
export class QuizAttemptService {
  constructor(
    @InjectModel(QuizAttempt.name)
    private quizAttemptModel: Model<QuizAttemptDocument>,
    @InjectModel(Flashcard.name)
    private flashcardModel: Model<Flashcard>,
    private readonly eventEmitter: EventEmitter2
  ) { }

  async create(userId: string, dto: CreateQuizAttemptDto) {
    const flashcard = await this.flashcardModel.findById(dto.flashcardId);
    if (!flashcard || flashcard.isDeleted) {
      throw new NotFoundException('Flashcard không tồn tại');
    }

    const attempt = await this.quizAttemptModel.create({
      userId: new Types.ObjectId(userId),
      flashcardId: new Types.ObjectId(dto.flashcardId),
      score: dto.score,
      correctCount: dto.correctCount,
      totalQuestions: dto.totalQuestions,
      timeSpent: dto.timeSpent,
    });
    //Emit
    this.eventEmitter.emit('quiz-completed', { userId })
    return attempt;
  }


  async findAllByUser(userId: string) {
    return this.quizAttemptModel
      .find({ userId: new Types.ObjectId })
      .populate('flashcardId', 'title grade')
      .sort({ createdAt: -1 });
  }

  async findOne(id: string) {
    return this.quizAttemptModel
      .findById(id)
      .populate('flashcardId', 'title grade')
      .populate('userId', 'fullName');
  }
}
