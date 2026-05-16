import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lesson, LessonDocument } from './schemas/lesson.schema';

@Injectable()
export class LessonService {
  constructor(@InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>) { }

  async getAll(grade?: string, lastId?: string, limit = 20) {
    const filter: any = { isDeleted: false }; // chỉ lấy bài chưa xoá
    if (grade) filter.grade = grade;
    if (lastId) filter._id = { $lt: lastId }; // lấy tiếp sau id cũ

    return this.lessonModel
      .find(filter)
      .populate('createdBy', 'username avatar') // lấy thông tin người tạo
      .sort({ _id: -1 })
      .limit(limit)
      .exec();
  }

  async getById(id: string) {
    return this.lessonModel
      .findOne({ _id: id, isDeleted: false })
      .populate('createdBy', 'username avatar')
      .exec();
  }

}
