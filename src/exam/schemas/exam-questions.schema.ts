import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema({ _id: true })
export class ExamQuestion {
    _id?: Types.ObjectId;

    @Prop({ required: true })
    question: string;

    @Prop({ type: [String], default: [] })
    options?: string[];

    @Prop({ type: [Number], default: [] })
    answers?: number[];

}

export const ExamQuestionSchema = SchemaFactory.createForClass(ExamQuestion);