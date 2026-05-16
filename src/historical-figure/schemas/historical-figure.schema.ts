import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type HistoricalFigureDocument = HistoricalFigure & Document;

// Các giai đoạn cuộc đời
export enum LifeStage {
    CHILDHOOD = 'childhood',
    YOUTH = 'youth',
    CAREER = 'career',
    LATER_LIFE = 'later_life',
    LEGACY = 'legacy', // phần di sản hoặc ghi chú cuối đời
}

export interface LifeStageContent {
    stage: LifeStage;
    title?: string; // tiêu đề giai đoạn, nếu cần
    description: string; // nội dung chi tiết
    startYear?: number;
    endYear?: number;
}

@Schema({ timestamps: true })
export class HistoricalFigure {
    @Prop({ required: true, unique: true })
    name: string;

    @Prop({ required: true })
    era: string;

    @Prop()
    birthYear?: number;

    @Prop()
    deathYear?: number;

    @Prop()
    basicInfo?: string; // mô tả ngắn gọn về nhân vật

    @Prop({
        type: [{
            stage: String,
            title: String,
            description: String,
            startYear: Number,
            endYear: Number
        }]
    })
    lifeStages: LifeStageContent[];

    @Prop({ type: String, required: true })
    thumbnail: string; // URL ảnh

    @Prop({ type: String, required: true })
    historical_significance: string;

    @Prop({ default: false })
    isDeleted: boolean; // soft delete

}

export const HistoricalFigureSchema = SchemaFactory.createForClass(HistoricalFigure);
