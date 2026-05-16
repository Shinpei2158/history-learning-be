import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '@/users/schemas/user.schema';
import { Flashcard } from './flashcard.schema';

@Schema({ _id: false }) // schema con, không cần _id riêng
class QuestionProgress {
    @Prop({ type: Types.ObjectId, required: true })
    questionId: Types.ObjectId; // thay cho questionOrder

    @Prop({ default: false })
    isRemembered: boolean;
}

const QuestionProgressSchema = SchemaFactory.createForClass(QuestionProgress);

@Schema({ timestamps: true })
export class UserFlashcardProgress {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: User | Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Flashcard', required: true })
    flashcardId: Flashcard | Types.ObjectId;

    @Prop({ default: 0 })
    currentIndex: number; // đang học tới thẻ số mấy

    @Prop({ default: false })
    completed: boolean; // đã hoàn thành bộ flashcard chưa

    @Prop({ type: [QuestionProgressSchema], default: [] })
    questionProgress: QuestionProgress[]; // lưu trạng thái từng câu hỏi

    @Prop({ default: 0 })
    timesCompleted: number; // số lần đã hoàn thành

    @Prop()
    lastLearnedAt: Date; // lần học gần nhất
}

export type UserFlashcardProgressDocument = UserFlashcardProgress & Document;
export const UserFlashcardProgressSchema =
    SchemaFactory.createForClass(UserFlashcardProgress);
