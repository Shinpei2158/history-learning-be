import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LessonLearn } from './schemas/lesson-learn.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class LessonLearnService {
  constructor(
    @InjectModel(LessonLearn.name)
    private readonly lessonLearnModel: Model<LessonLearn>,
    private readonly eventEmitter: EventEmitter2,
  ) { }

  // Lấy tiến độ của user cho 1 bài học
  async getProgress(userId: string, lessonId: string) {
    return this.lessonLearnModel.findOne({
      userId: new Types.ObjectId(userId),
      lessonId: new Types.ObjectId(lessonId),
    });
  }

  // Lấy danh sách tất cả tiến độ của user
  async getUserLessons(userId: string) {
    return this.lessonLearnModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate('lessonId');
  }

  // Cập nhật hoặc tạo mới tiến độ học
  async updateProgress(userId: string, lessonId: string, score: number, timeSpent: number) {
    const isCompleted = score >= 80;

    const existing = await this.lessonLearnModel.findOne({
      userId: new Types.ObjectId(userId),
      lessonId: new Types.ObjectId(lessonId),
    });

    if (existing) {
      existing.score = score;
      existing.isCompleted = isCompleted;
      existing.history.push({ score, attemptDate: new Date(), timeSpent });
      const saved = await existing.save();

      //Emit
      if (isCompleted) {
        this.eventEmitter.emit('lesson-completed', { studentId: userId })
      }
      return saved;
    }

    const newProgress = new this.lessonLearnModel({
      userId: new Types.ObjectId(userId),
      lessonId: new Types.ObjectId(lessonId),
      score,
      isCompleted,
      history: [{ score, attemptDate: new Date(), timeSpent }],
    });

    const saved = await newProgress.save();

    if (isCompleted) {
      this.eventEmitter.emit('lesson-completed', { studentId: userId });
    }
    return saved;
  }

  // Reset tiến độ học
  async resetProgress(userId: string, lessonId: string) {
    const progress = await this.lessonLearnModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId), lessonId: new Types.ObjectId(lessonId) },
      { score: 0, isCompleted: false, history: [] },
      { new: true },
    );

    if (!progress) throw new NotFoundException('Không tìm thấy tiến độ học.');
    return progress;
  }

  // Lấy mảng lessonId của các lesson đã hoàn thành (chỉ string)
  async getCompletedLessons(userId: string) {
    const lessons = await this.lessonLearnModel
      .find({ userId: new Types.ObjectId(userId), isCompleted: true })
      .select('lessonId');

    return lessons.map((l) => l.lessonId.toString());
  }
}
