import { Grade } from "@/common/enums/grade";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { ExamQuestion, ExamQuestionSchema } from "./exam-questions.schema";

@Schema({ timestamps: true })
export class ExamBank {

    @Prop({ type: String, required: true })
    title: string

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    teacherId: Types.ObjectId

    @Prop({ enum: Grade, required: true })
    grade: Grade;

    // Câu trắc nghiệm
    @Prop({ type: [ExamQuestionSchema], default: [] })
    questions: ExamQuestion[];

    @Prop({ type: String })
    description?: string;

    @Prop({ default: false })
    isPublished: boolean;

    @Prop({ type: Number, default: 0 })
    totalQuestions: number;

    @Prop({ default: false })
    isDeleted: boolean;
}

export type ExamBankDocument = ExamBank & Document
export const ExamBankSchema = SchemaFactory.createForClass(ExamBank);
ExamBankSchema.index({ teacherId: 1 });

ExamBankSchema.pre<ExamBankDocument>("save", function (next) {
    this.totalQuestions = this.questions?.length || 0;
    next();
});


ExamBankSchema.pre("findOneAndUpdate", function (next) {
    const update = this.getUpdate() as any;
    if (update?.$set) {
        update.$set.totalQuestions = update.$set.questions?.length || 0;
    }
    next();
});