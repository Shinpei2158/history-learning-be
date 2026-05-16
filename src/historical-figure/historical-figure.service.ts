import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { HistoricalFigure, HistoricalFigureDocument } from './schemas/historical-figure.schema';

@Injectable()
export class HistoricalFigureService {
  constructor(
    @InjectModel(HistoricalFigure.name)
    private readonly historicalFigureModel: Model<HistoricalFigureDocument>,
  ) { }

  // Dành cho user/admin: lấy danh sách nhân vật (chỉ nhân vật chưa xoá)
  async getAll(): Promise<HistoricalFigure[]> {
    return this.historicalFigureModel
      .find({ isDeleted: false })
      .select('name era basicInfo thumbnail birthYear deathYear')
      .sort({ name: 1 })
      .exec();
  }

  // Lấy chi tiết 1 nhân vật theo id
  async getById(id: string): Promise<HistoricalFigure> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('ID không hợp lệ');
    const figure = await this.historicalFigureModel.findById(id);
    if (!figure || figure.isDeleted) throw new NotFoundException('Không tìm thấy nhân vật');
    return figure;
  }

  // Admin: tạo mới nhân vật
  async create(data: Partial<HistoricalFigure>): Promise<HistoricalFigure> {
    const newFigure = new this.historicalFigureModel(data);
    return newFigure.save();
  }

  // Admin: cập nhật nhân vật
  async update(id: string, data: Partial<HistoricalFigure>): Promise<HistoricalFigure> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('ID không hợp lệ');
    const updated = await this.historicalFigureModel.findByIdAndUpdate(id, data, { new: true });
    if (!updated) throw new NotFoundException('Không tìm thấy nhân vật');
    return updated;
  }

  // Admin: soft delete
  async delete(id: string): Promise<{ deleted: boolean }> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('ID không hợp lệ');
    const figure = await this.historicalFigureModel.findByIdAndUpdate(id, { isDeleted: true });
    if (!figure) throw new NotFoundException('Không tìm thấy nhân vật');
    return { deleted: true };
  }
}
