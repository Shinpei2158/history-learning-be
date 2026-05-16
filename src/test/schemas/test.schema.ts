import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { User } from "@/users/schemas/user.schema";
import { Grade } from "@/common/enums/grade";
import { TestQuestion, TestQuestionSchema } from "./test-question.schema";

@Schema({ timestamps: true })
export class Test {
    @Prop({ type: Types.ObjectId, ref: "User", required: true })
    userId: User | Types.ObjectId; // người tạo (teacher)

    @Prop({ required: true })
    title: string;

    @Prop({ enum: Grade, required: true })
    grade: Grade;

    @Prop({ required: false, default: "" })
    code: string; // mã bài kiểm tra (VD: TEST_ABC123)

    @Prop({ type: [TestQuestionSchema], default: [] })
    questions: TestQuestion[];

    @Prop({ default: false })
    isPublic: boolean; // công khai cho học sinh

    @Prop({ default: false })
    isDeleted: boolean;

    @Prop({ default: 0 })
    views: number;

    @Prop({ default: 0 })
    attempts: number; // số lượt làm bài

    @Prop({ default: false })
    isPublished: boolean; // đã xuất bản hay chưa

    @Prop({ default: false })
    isExam: boolean; // true = bài thi thật, false = ôn tập

    @Prop()
    startTime?: Date; // chỉ dùng cho bài thi thật

    @Prop()
    endTime?: Date;   // chỉ dùng cho bài thi thật

    @Prop({ default: 0 })
    duration?: number; // giới hạn thời gian làm bài (phút)

}

export type TestDocument = Test & Document;
export const TestSchema = SchemaFactory.createForClass(Test);
