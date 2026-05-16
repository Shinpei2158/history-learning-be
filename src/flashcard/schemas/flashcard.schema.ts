import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Grade } from '@/common/enums/grade';

@Schema({ _id: true })
export class Question {

    _id?: Types.ObjectId;

    @Prop({ required: true })
    question: string;

    @Prop({ type: [String], required: true, default: [] })
    options: string[];

    @Prop({ type: [Number], default: [] })
    answer: number[];

}

export const QuestionSchema = SchemaFactory.createForClass(Question);

@Schema({ timestamps: true })
export class Flashcard {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ required: true })
    title: string;

    @Prop({ default: false })
    isPublished: boolean;

    @Prop({ enum: Grade, required: true })
    grade: Grade;

    // này không cần thiết cho lắm, số lượng index trong mảng answer là đủ xác định single hay multi rồi, nhưng tạm để, nào update tính sau
    @Prop({ enum: ["single", "multiple"], default: "single" })
    type: string;

    // Dùng QuestionSchema thay vì Object
    @Prop({ type: [QuestionSchema], default: [] })
    questions: Question[];

    @Prop()
    description?: string;

    @Prop({ default: false })
    isDeleted: boolean;
}

export type FlashcardDocument = Flashcard & Document;
export const FlashcardSchema = SchemaFactory.createForClass(Flashcard);

FlashcardSchema.pre('save', function (next) {
    if (this.type === 'single') {
        for (const q of this.questions) {
            if (q.answer.length > 1)
                throw new Error('Single choice question cannot have multiple answers');
        }
    }
    next();
});
