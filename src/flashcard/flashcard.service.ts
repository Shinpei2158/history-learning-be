import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Flashcard, FlashcardDocument } from './schemas/flashcard.schema';
import { UserFlashcardProgress, UserFlashcardProgressDocument } from './schemas/user-flashcard-grogress.schema';
import { FlashcardLike, FlashcardLikeDocument } from './schemas/user-flashcard-like.schema';
import { CreateFlashcardDto } from './dto/create-flashcard.dto';
import * as XLSX from 'xlsx';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class FlashcardService {
  constructor(
    @InjectModel(Flashcard.name) private flashcardModel: Model<FlashcardDocument>,
    @InjectModel(UserFlashcardProgress.name) private userFlashcardProgressModel: Model<UserFlashcardProgressDocument>,
    @InjectModel(FlashcardLike.name) private flashcardLikeModel: Model<FlashcardLikeDocument>,
    private readonly eventEmitter: EventEmitter2
  ) { }

  // Lấy danh sách flashcard chung (đã publish)
  async getAll(grade?: string, lastId?: string, limit = 20) {
    const filter: any = { isPublished: true, isDeleted: false };
    if (grade) filter.grade = grade;
    if (lastId) filter._id = { $lt: lastId }; // phân trang

    return this.flashcardModel
      .find(filter)
      .populate('userId', 'username role avatar')
      .sort({ _id: -1 })
      .limit(limit)
      .exec();
  }

  // Lấy flashcard theo user
  async getUserFlashcards(userId: string) {
    return this.flashcardModel
      .find({ userId: new Types.ObjectId(userId), isDeleted: false })
      .populate('userId', 'username avatar')
      .sort({ createdAt: -1 })
      .exec();
  }

  // Lấy chi tiết flashcard
  async getById(id: string): Promise<Flashcard> {
    const flashcard = await this.flashcardModel
      .findOne({ _id: id, isDeleted: false })
      .populate('userId', 'username avatar')
      .exec();

    if (!flashcard) throw new NotFoundException('Flashcard không tồn tại');
    return flashcard;
  }

  // Cập nhật tiến độ học
  async updateProgress(
    userId: string,
    flashcardId: string,
    data: { currentIndex: number; completed?: boolean }
  ) {
    const updateOps: any = {
      $set: {
        currentIndex: data.currentIndex,
        lastLearnedAt: new Date(),
      },
    };

    if (data.completed) {
      updateOps.$set.completed = true;
      updateOps.$inc = { timesCompleted: 1 };
    }

    return this.userFlashcardProgressModel.findOneAndUpdate(
      { userId, flashcardId },
      updateOps,
      { upsert: true, new: true }
    );
  }

  // Đánh dấu đã nhớ / chưa nhớ 1 câu
  async markQuestion(
    userId: string,
    flashcardId: string,
    questionId: string,
    isRemembered: boolean
  ) {
    const progress = await this.userFlashcardProgressModel.findOne({
      userId,
      flashcardId,
    });

    if (!progress) {
      // chưa có document -> tạo mới
      return this.userFlashcardProgressModel.create({
        userId,
        flashcardId,
        questionProgress: [{ questionId: new Types.ObjectId(questionId), isRemembered }],
        lastLearnedAt: new Date(),
      });
    }

    const existing = progress.questionProgress.find(
      (q) => q.questionId.toString() === questionId
    );

    if (existing) {
      existing.isRemembered = isRemembered;
    } else {
      progress.questionProgress.push({
        questionId: new Types.ObjectId(questionId),
        isRemembered,
      });
    }

    progress.lastLearnedAt = new Date();
    await progress.save();

    return progress;
  }

  // Lấy các câu chưa nhớ
  async getUnrememberedQuestions(userId: string, flashcardId: string) {
    const progress = await this.userFlashcardProgressModel.findOne({ userId, flashcardId });
    if (!progress) return [];

    const flashcard = await this.flashcardModel.findById(flashcardId).lean();
    if (!flashcard) return [];

    const unrememberedIds = progress.questionProgress
      .filter((q) => !q.isRemembered)
      .map((q) => q.questionId.toString());

    return flashcard.questions.filter((q) =>
      unrememberedIds.includes(q._id.toString())
    );
  }

  // Reset tiến độ học
  async resetProgress(userId: string, flashcardId: string) {
    return this.userFlashcardProgressModel.findOneAndUpdate(
      { userId, flashcardId },
      {
        $set: {
          questionProgress: [],
          currentIndex: 0,
          completed: false,
          timesCompleted: 0,
          lastLearnedAt: new Date(),
        },
      },
      { new: true, upsert: true }
    );
  }

  // Toggle like
  async toggleLike(userId: string, flashcardId: string) {
    const existing = await this.flashcardLikeModel.findOne({ userId, flashcardId });
    if (existing) {
      await existing.deleteOne();
    } else {
      await this.flashcardLikeModel.create({ userId, flashcardId });
      //Emit
      this.eventEmitter.emit('flashcard-liked', { userId });
    }
    const count = await this.countLikes(flashcardId);
    return { liked: !existing, likeCount: count };
  }

  // Kiểm tra user đã like chưa
  async isLiked(userId: string, flashcardId: string) {
    const existing = await this.flashcardLikeModel.findOne({ userId, flashcardId });
    return !!existing;
  }

  // Lấy danh sách flashcard đã like
  async getUserLikedFlashcards(userId: string) {
    const likes = await this.flashcardLikeModel
      .find({ userId })
      .populate({
        path: 'flashcardId',
        match: { isDeleted: false },
      });

    return likes
      .map((l) => l.flashcardId)
      .filter((fc) => fc);
  }

  // Đếm số like
  async countLikes(flashcardId: string) {
    return this.flashcardLikeModel.countDocuments({ flashcardId });
  }

  // Tạo hoặc cập nhật flashcard
  async upsertFlashcard(userId: string, dto: CreateFlashcardDto & { id?: string }) {
    if (dto.id) {
      const existing = await this.flashcardModel.findOne({
        _id: dto.id,
        userId: new Types.ObjectId(userId),
        isDeleted: false,
      });

      if (!existing)
        throw new BadRequestException('Flashcard không tồn tại hoặc không có quyền chỉnh sửa');

      existing.title = dto.title;
      existing.grade = dto.grade;
      existing.isPublished = dto.isPublished ?? existing.isPublished;
      existing.description = dto.description ?? existing.description;
      existing.type = dto.type ?? existing.type;

      // Cập nhật câu hỏi
      existing.questions = dto.questions.map((q) => ({
        _id: q._id ? new Types.ObjectId(q._id) : undefined,
        question: q.question,
        options: q.options,
        // Sắp xếp index đáp án tăng dần nếu là mảng
        answer: Array.isArray(q.answer)
          ? [...q.answer].sort((a, b) => a - b)
          : q.answer,
      }));

      await existing.save();
      return existing;
    } else {
      // Tạo mới
      const created = new this.flashcardModel({
        ...dto,
        userId: new Types.ObjectId(userId),
        questions: dto.questions.map((q) => ({
          question: q.question,
          options: q.options,
          // Sắp xếp luôn khi tạo mới
          answer: Array.isArray(q.answer)
            ? [...q.answer].sort((a, b) => a - b)
            : q.answer,
        })),
      });
      this.eventEmitter.emit('flashcard-created', { userId });
      return created.save();
    }
  }

  // Xóa mềm flashcard
  async softDelete(id: string): Promise<Flashcard> {
    const flashcard = await this.flashcardModel.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );

    if (!flashcard) throw new NotFoundException('Flashcard không tồn tại');
    return flashcard;
  }

  async importFlashcardExcel(userId: string, fileBuffer: Buffer, dto: any) {
    // Đọc file Excel
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    if (!rows.length)
      throw new BadRequestException('File Excel không có dữ liệu');

    // Duyệt từng dòng để tạo question
    const questions = rows.map((row: any, idx: number) => {
      const questionText = String(row.Question || '').trim();
      const options = String(row.Options || '')
        .split('\\')
        .map((o) => o.trim())
        .filter(Boolean);
      const answer = String(row.Answer || '')
        .trim()
        .split(/\s+/)
        .map((i) => Number(i))
        .filter((i) => !isNaN(i))
        .sort((a, b) => a - b);

      // Validate từng hàng
      if (!questionText)
        throw new BadRequestException(`Dòng ${idx + 2}: Thiếu nội dung câu hỏi`);
      if (options.length < 2)
        throw new BadRequestException(`Dòng ${idx + 2}: Phải có ít nhất 2 lựa chọn`);
      if (answer.some((a) => a < 0 || a >= options.length))
        throw new BadRequestException(`Dòng ${idx + 2}: Index đáp án không hợp lệ`);

      return { question: questionText, options, answer };
    });

    // Tạo flashcard mới
    const flashcard = new this.flashcardModel({
      userId: new Types.ObjectId(userId),
      title: dto.title?.trim(),
      grade: dto.grade,
      isPublished: dto.isPublished ?? false,
      type: 'multiple', // luôn multiple cho giáo viên
      description: dto.description?.trim() ?? '',
      questions,
    });

    return flashcard.save();
  }

}
