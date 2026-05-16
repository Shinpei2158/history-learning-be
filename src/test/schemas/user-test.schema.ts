import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { User } from "@/users/schemas/user.schema";
import { Test } from "./test.schema";

@Schema({ timestamps: true })
export class UserTest {
    @Prop({ type: Types.ObjectId, ref: "User", required: true })
    userId: User | Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "Test", required: true })
    testId: Test | Types.ObjectId;

    @Prop({ type: Map, of: [String], default: {} })
    answers: Map<string, string[]>;
    // key = questionId, value = mảng đáp án học sinh chọn

    @Prop()
    startTime: Date;

    @Prop()
    endTime: Date;

    @Prop({ default: 0 })
    score: number;

    @Prop({ default: false })
    isSubmitted: boolean;

    @Prop({ default: false })
    isLate: boolean; // nộp muộn (sau endTime)
}

export type UserTestDocument = UserTest & Document;
export const UserTestSchema = SchemaFactory.createForClass(UserTest);
