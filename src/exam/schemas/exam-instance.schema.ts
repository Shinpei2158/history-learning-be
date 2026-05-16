import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { ExamQuestion, ExamQuestionSchema } from "./exam-questions.schema";


@Schema({ timestamps: true })
export class ExamInstance {

    @Prop({ type: Types.ObjectId, ref: 'ExamSession', required: true })
    sessionId: Types.ObjectId;

    // tạo tự động (exam session - đề x)
    @Prop({ type: String })
    title: string;

    @Prop({ type: [ExamQuestionSchema] })
    questions: ExamQuestion[]; // câu hỏi được xào ra từ kho đề
}
export type ExamInstanceDocument = ExamInstance & Document;
export const ExamInstanceSchema = SchemaFactory.createForClass(ExamInstance);

ExamInstanceSchema.post("save", async function (doc, next) {
    const ExamSessionModel = doc.model("ExamSession");
    await ExamSessionModel.findByIdAndUpdate(doc.sessionId, { $inc: { instanceCount: 1 } });
    next();
});

ExamInstanceSchema.post("findOneAndDelete", async function (doc, next) {
    const ExamSessionModel = doc.model("ExamSession");
    await ExamSessionModel.findByIdAndUpdate(doc.sessionId, { $inc: { instanceCount: -1 } });
    next();
});