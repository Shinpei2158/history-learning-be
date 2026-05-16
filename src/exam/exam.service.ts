import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ExamBank, ExamBankDocument } from './schemas/exam-bank.schema';
import { CreateExamBankDto } from './dto/create-exam-bank.dto';
import { ExamInstance, ExamInstanceDocument } from './schemas/exam-instance.schema';
import { ExamSession, ExamSessionDocument } from './schemas/exam-session.schema';
import { CreateExamSessionDto } from './dto/create-exam-session.dto';
import { ExamAttempt, ExamAttemptDocument } from './schemas/exam-attempt.schema';

@Injectable()
export class ExamService {
  constructor(
    @InjectModel(ExamBank.name)
    private examBankModel: Model<ExamBankDocument>,
    @InjectModel(ExamInstance.name)
    private readonly examInstanceModel: Model<ExamInstanceDocument>,
    @InjectModel(ExamSession.name)
    private readonly examSessionModel: Model<ExamSessionDocument>,
    @InjectModel(ExamAttempt.name)
    private readonly examAttemptModel: Model<ExamAttemptDocument>,
  ) { }

  // Helper: map DTO sang schema
  private mapQuestions(dto: CreateExamBankDto) {
    const questions = dto.questions.map((q) => ({
      _id: q._id ? new Types.ObjectId(q._id) : undefined,
      question: q.question,
      options: q.options,
      answers: Array.isArray(q.answers)
        ? [...q.answers].sort((a, b) => a - b)
        : [],
    }));
    return { questions };
  }

  /** 🧩 Tạo hoặc cập nhật kho đề (ExamBank) */
  async upsertExamBank(
    userId: string,
    dto: CreateExamBankDto & { id?: string },
  ) {
    const teacherId = new Types.ObjectId(userId);

    if (dto.id) {
      const existing = await this.examBankModel.findOne({
        _id: dto.id,
        teacherId,
        isDeleted: false,
      });

      if (!existing)
        throw new BadRequestException(
          'Kho đề không tồn tại hoặc bạn không có quyền chỉnh sửa.',
        );

      const { questions } = this.mapQuestions(dto);

      existing.title = dto.title;
      existing.grade = dto.grade;
      existing.description = dto.description ?? existing.description;
      existing.isPublished = dto.isPublished ?? existing.isPublished;
      existing.questions = questions;

      await existing.save();
      return existing;
    }

    const { questions } = this.mapQuestions(dto);
    const created = new this.examBankModel({
      title: dto.title,
      teacherId,
      grade: dto.grade,
      description: dto.description,
      isPublished: dto.isPublished ?? false,
      questions,
    });

    return await created.save();
  }

  /** 🗑️ Soft delete */
  async removeExamBank(id: string, teacherId: string) {
    const bank = await this.examBankModel.findById(id);
    if (!bank) throw new NotFoundException('Không tìm thấy kho đề');
    if (bank.teacherId.toString() !== teacherId)
      throw new ForbiddenException('Không có quyền xóa kho đề này');

    bank.isDeleted = true;
    await bank.save();
    return { message: 'Đã xóa kho đề', bank };
  }

  /** Danh sách kho đề của giáo viên */
  async getTeacherBanks(teacherId: string) {
    return await this.examBankModel
      .find({ teacherId: new Types.ObjectId(teacherId), isDeleted: false })
      .sort({ createdAt: -1 });
  }

  /** 🔍 Chi tiết kho đề */
  async getExamBankById(id: string) {
    const bank = await this.examBankModel.findById(id);
    if (!bank) throw new NotFoundException('Không tìm thấy kho đề');
    return bank;
  }

  /** 🧮 Tạo kỳ thi từ kho đề (ExamSession + ExamInstances) */
  async createExamFromBank(teacherId: string, dto: CreateExamSessionDto) {
    const bank = await this.examBankModel.findById(dto.bankId);
    if (!bank) throw new NotFoundException('Kho đề không tồn tại');

    if (dto.numChoice > bank.questions.length)
      throw new BadRequestException('Số câu trắc nghiệm vượt quá số lượng trong kho');

    // Tạo kỳ thi
    const session = await this.examSessionModel.create({
      title: dto.title,
      bankId: bank._id,
      teacherId: new Types.ObjectId(teacherId),
      groupId: dto.groupId ? new Types.ObjectId(dto.groupId) : undefined,
      isPublic: true,
      numChoice: dto.numChoice,
      duration: dto.duration,
      startTime: dto.startTime,
      endTime: dto.endTime,
      maxAttempts: dto.maxAttempts || 1,
      code: dto.code || '',
      status: 'active',
      instanceCount: 0,
    });

    // Sinh các đề ngẫu nhiên
    const instances: Partial<ExamInstance>[] = [];
    for (let i = 0; i < dto.instanceCount; i++) {
      const shuffled = [...bank.questions].sort(() => Math.random() - 0.5);
      instances.push({
        sessionId: session._id,
        title: `${session.title} - Đề ${i + 1}`,
        questions: shuffled.slice(0, dto.numChoice),
      });
    }

    const createdInstances = await this.examInstanceModel.insertMany(instances);
    await this.examSessionModel.findByIdAndUpdate(session._id, {
      $set: { instanceCount: createdInstances.length },
    });

    return {
      message: 'Tạo kỳ thi thành công',
      session,
      instanceCount: createdInstances.length,
    };
  }

  /** 📅 Lấy danh sách kỳ thi theo nhóm */
  async getSessionsByGroup(groupId: string): Promise<any[]> {
    return this.examSessionModel
      .find({ groupId: new Types.ObjectId(groupId), isDeleted: false })
      .populate('bankId', 'title grade')
      .sort({ createdAt: -1 })
      .lean();
  }

  /** 🎓 Kỳ thi khả dụng cho học sinh */
  async getAvailableExamsForStudent(groupId: string) {
    const now = new Date();
    return await this.examSessionModel
      .find({
        groupId: new Types.ObjectId(groupId),
        status: 'active',
        startTime: { $lte: now },
        endTime: { $gte: now },
      })
      .populate('bankId', 'title grade')
      .select('title duration numChoice maxAttempts startTime endTime code');
  }

  /** ▶️ Bắt đầu làm bài */
  async startExam(sessionId: string, studentId: string) {
    const session = await this.examSessionModel.findById(sessionId);
    if (!session || session.isDeleted)
      throw new NotFoundException('Kỳ thi không tồn tại hoặc đã bị xóa');

    const now = new Date();
    if (session.startTime && now < session.startTime)
      throw new BadRequestException('Chưa đến thời gian làm bài');
    if (session.endTime && now > session.endTime)
      throw new BadRequestException('Kỳ thi đã kết thúc');

    let attempt = await this.examAttemptModel.findOne({
      sessionId,
      studentId,
    });

    if (attempt) {
      const instance = await this.examInstanceModel.findById(attempt.instanceId);
      return { attempt, instance };
    }

    const instances = await this.examInstanceModel.find({ sessionId: new Types.ObjectId(sessionId) });
    if (instances.length === 0)
      throw new BadRequestException('Kỳ thi này chưa có đề thi nào');

    const randomInstance = instances[Math.floor(Math.random() * instances.length)];

    attempt = await this.examAttemptModel.create({
      sessionId: new Types.ObjectId(sessionId),
      instanceId: randomInstance._id,
      studentId: new Types.ObjectId(studentId),
      status: 'in_progress',
      startedAt: now,
      totalQuestions: randomInstance.questions.length,
    });

    return {
      message: 'Bắt đầu làm bài thi',
      attemptId: attempt._id,
      instance: randomInstance,
    };
  }

  /** 🧾 Nộp bài */
  async submitExam(attemptId: string, answersDto: any, studentId: string) {
    const attempt = await this.examAttemptModel.findById(attemptId);
    if (!attempt) throw new NotFoundException('Không tìm thấy bài làm');
    if (attempt.studentId.toString() !== studentId)
      throw new ForbiddenException('Không có quyền nộp bài này');

    const instance = await this.examInstanceModel.findById(attempt.instanceId);
    if (!instance) throw new NotFoundException('Không tìm thấy mã đề');

    const numChoice = instance.questions.length || 1;
    const eachScore = 10 / numChoice;

    let correctCount = 0;
    let totalScore = 0;
    const answers = [];

    for (const q of instance.questions) {
      const userAns = answersDto.answers?.find(
        (a) => a.questionId === q._id.toString(),
      );
      const chosen = userAns?.chosenAnswers || [];
      const isCorrect =
        chosen.length === q.answers.length &&
        chosen.every((a: number) => q.answers.includes(a));

      if (isCorrect) {
        correctCount++;
        totalScore += eachScore;
      }

      answers.push({
        questionId: q._id,
        chosenAnswers: chosen,
        isCorrect,
      });
    }

    totalScore = Math.round(totalScore * 100) / 100;

    attempt.answers = answers;
    attempt.correctCount = correctCount;
    attempt.score = totalScore;
    attempt.submittedAt = new Date();
    attempt.status = 'submitted';
    await attempt.save();

    return {
      message: 'Nộp bài thành công',
      score: totalScore,
      correctCount,
    };
  }

  /** 🔎 Xem chi tiết attempt */
  async getAttemptDetail(attemptId: string, studentId: string) {
    const attempt = await this.examAttemptModel
      .findById(attemptId)
      .populate('instanceId');

    if (!attempt) throw new NotFoundException('Không tìm thấy bài làm');
    if (attempt.studentId.toString() !== studentId)
      throw new ForbiddenException('Không có quyền xem bài làm này');

    return {
      attemptId: attempt._id,
      instance: attempt.instanceId,
      answers: attempt.answers || [],
      status: attempt.status,
      score: attempt.score,
      correctCount: attempt.correctCount,
    };
  }
}
