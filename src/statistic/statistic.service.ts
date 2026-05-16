import { LessonLearn, LessonLearnDocument } from '@/lesson-learn/schemas/lesson-learn.schema';
import { QuizAttempt, QuizAttemptDocument } from '@/quiz/schemas/quiz-attempt.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

@Injectable()
export class StatisticService {
  constructor(
    @InjectModel(QuizAttempt.name)
    private quizAttemptModel: Model<QuizAttemptDocument>,
    @InjectModel(LessonLearn.name) private lessonLearnModel: Model<LessonLearnDocument>
  ) { }

  async getQuizStats(userId: string, month?: number, year?: number) {
    const match: any = {
      userId: new Types.ObjectId(userId),
    };

    // Lọc theo tháng/năm nếu có
    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 1);
      match.completedAt = { $gte: start, $lt: end };
    } else if (year) {
      const start = new Date(year, 0, 1);
      const end = new Date(year + 1, 0, 1);
      match.completedAt = { $gte: start, $lt: end };
    }

    // Gom thống kê
    const stats = await this.quizAttemptModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalAttempts: { $sum: 1 },
          avgScore: { $avg: "$score" },
          totalCorrect: { $sum: "$correctCount" },
          totalQuestions: { $sum: "$totalQuestions" },
          totalTime: { $sum: "$timeSpent" },
          flashcardIds: { $addToSet: "$flashcardId" },
        },
      },
      {
        $project: {
          totalAttempts: 1,
          avgScore: 1,
          totalCorrect: 1,
          totalQuestions: 1,
          totalTime: 1,
          totalQuiz: { $size: "$flashcardIds" },
        },
      },
    ]);

    if (stats.length === 0) {
      return {
        totalAttempts: 0,
        avgScore: 0,
        totalCorrect: 0,
        totalQuestions: 0,
        totalTime: 0,
        totalQuiz: 0,
      };
    }

    const result = stats[0];
    return {
      totalAttempts: result.totalAttempts,
      avgScore: parseFloat(result.avgScore.toFixed(2)),
      totalCorrect: result.totalCorrect,
      totalQuestions: result.totalQuestions,
      totalTime: result.totalTime,
      totalQuiz: result.totalQuiz,
    };
  }

  async getLessonStats(userId: string, month?: number, year?: number) {
    const match: any = {
      userId: new Types.ObjectId(userId),
    };

    // Lọc theo tháng/năm (dựa trên history.attemptDate)
    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 1);
      match["history.attemptDate"] = { $gte: start, $lt: end };
    } else if (year) {
      const start = new Date(year, 0, 1);
      const end = new Date(year + 1, 0, 1);
      match["history.attemptDate"] = { $gte: start, $lt: end };
    }

    // Gom thống kê (mỗi phần tử history xem như 1 attempt)
    const stats = await this.lessonLearnModel.aggregate([
      { $unwind: "$history" },
      { $match: match },
      {
        $group: {
          _id: "$lessonId",
          attempts: { $sum: 1 },
          totalScore: { $sum: "$history.score" },
          scoreCount: { $sum: 1 },
          totalTimeSpent: { $sum: "$history.timeSpent" }
        },
      },
      {
        $group: {
          _id: null,
          totalLessonsLearned: { $sum: 1 },
          totalAttempts: { $sum: "$attempts" },
          totalScore: { $sum: "$totalScore" },
          totalScoreCount: { $sum: "$scoreCount" },
          totalTimeSpent: { $sum: "$totalTimeSpent" }
        },
      },
    ]);

    if (stats.length === 0) {
      return {
        totalLessonsLearned: 0,
        totalAttempts: 0,
        averageScore: 0,
        totalTimeSpent: 0,
      };
    }

    const result = stats[0];
    const averageScore =
      result.totalScoreCount > 0 ? result.totalScore / result.totalScoreCount : 0;

    return {
      totalLessonsLearned: result.totalLessonsLearned,
      totalAttempts: result.totalAttempts,
      averageScore: Math.round(averageScore * 10) / 10,
      totalTimeSpent: result.totalTimeSpent
    };
  }

}
