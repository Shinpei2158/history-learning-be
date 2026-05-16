import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema({ timestamps: true })
export class ExamAttempt {
    @Prop({ type: Types.ObjectId, ref: "ExamSession", required: true })
    sessionId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "ExamInstance", required: true })
    instanceId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true })
    studentId: Types.ObjectId;

    @Prop({ type: String, enum: ["not_started", "in_progress", "submitted"], default: "not_started" })
    status: string;

    @Prop({ type: Number, default: 0 })
    score: number;

    @Prop({ type: Number, default: 0 })
    correctCount: number;

    @Prop({ type: Date })
    startedAt?: Date;

    @Prop({ type: Date })
    submittedAt?: Date;

    @Prop({ type: Number, default: 0 })
    totalQuestions: number;


    @Prop({
        type: [
            {
                questionId: { type: Types.ObjectId },
                chosenAnswers: [Number],
                isCorrect: Boolean,
            },
        ],
        default: [],
    })
    answers: {
        questionId: Types.ObjectId;
        chosenAnswers?: number[];
        isCorrect?: boolean;
    }[];
}

export type ExamAttemptDocument = ExamAttempt & Document;
export const ExamAttemptSchema = SchemaFactory.createForClass(ExamAttempt);
ExamAttemptSchema.index({ studentId: 1, sessionId: 1 }, { unique: true });
