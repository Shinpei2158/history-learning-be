import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class LessonLearn extends Document {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId; // học sinh (role: student)

    @Prop({ type: Types.ObjectId, ref: 'Lesson', required: true })
    lessonId: Types.ObjectId; // bài học

    @Prop({ type: Number, default: 0, min: 0, max: 100 })
    score: number; // % câu đúng lần gần nhất

    @Prop({ type: Boolean, default: false })
    isCompleted: boolean; // true nếu đạt >= 80%

    @Prop({
        type: [
            {
                attemptDate: { type: Date, default: Date.now },
                score: { type: Number, min: 0, max: 100 },
                timeSpent: { type: Number, default: 0 }
            },
        ],
        default: [],
    })
    history: {
        attemptDate: Date;
        score: number;
        timeSpent: number;
    }[]; // lịch sử các lần làm (để xem tiến bộ)
}

export type LessonLearnDocument = LessonLearn & Document;
export const LessonLearnSchema = SchemaFactory.createForClass(LessonLearn);
