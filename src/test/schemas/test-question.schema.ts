import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export enum QuestionType {
    SINGLE = "single",   // chọn 1 đáp án
    MULTIPLE = "multiple" // chọn nhiều đáp án
}

@Schema({ _id: true })
export class TestQuestion {
    _id?: Types.ObjectId;

    @Prop({ required: true })
    question: string;

    @Prop()
    image?: string; // link ảnh minh họa (nếu có)

    @Prop({ type: [String], required: true, default: [] })
    choices: string[];

    @Prop({ type: [String], required: true, default: [] })
    correctAnswers: string[]; // hỗ trợ nhiều đáp án đúng

    @Prop({ enum: QuestionType, default: QuestionType.SINGLE })
    type: QuestionType;

    @Prop()
    explanation?: string; // giải thích đáp án (nếu có)
}

export const TestQuestionSchema = SchemaFactory.createForClass(TestQuestion);
export type TestQuestionDocument = TestQuestion & Document;
