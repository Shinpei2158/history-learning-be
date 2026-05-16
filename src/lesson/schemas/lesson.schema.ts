// lesson.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Grade } from '@/common/enums/grade';

@Schema({ _id: true })
export class LessonQuestion {
    @Prop({ type: Types.ObjectId, auto: true })
    _id: Types.ObjectId;

    @Prop({ required: true })
    question: string;

    @Prop({ type: [String], required: true })
    options: string[];

    @Prop({ required: true })
    correctAnswer: number[];
}

const LessonQuestionSchema = SchemaFactory.createForClass(LessonQuestion);

@Schema({ timestamps: true })
export class Lesson {
    @Prop({ required: true })
    title: string;

    @Prop({ enum: Grade, required: true })
    grade: Grade;

    @Prop({ required: true })
    link: string; // link bài Canva

    @Prop({ type: [LessonQuestionSchema], default: [] })
    questions: LessonQuestion[];

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    createdBy: Types.ObjectId; // có thể là teacher hoặc admin

    @Prop({ default: false })
    isDeleted: boolean;
}

export type LessonDocument = Lesson & Document;
export const LessonSchema = SchemaFactory.createForClass(Lesson);
