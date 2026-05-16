import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class QuizAttempt {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Flashcard', required: true })
    flashcardId: Types.ObjectId;

    @Prop({ required: true })
    score: number; // % điểm hoặc số điểm tùy bạn

    @Prop({ required: true })
    correctCount: number;

    @Prop({ required: true })
    totalQuestions: number;

    @Prop()
    timeSpent?: number; // giây

    @Prop({ default: Date.now })
    completedAt: Date;
}

export type QuizAttemptDocument = QuizAttempt & Document;
export const QuizAttemptSchema = SchemaFactory.createForClass(QuizAttempt);
