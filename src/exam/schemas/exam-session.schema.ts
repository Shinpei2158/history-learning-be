import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema({ timestamps: true })
export class ExamSession {
    @Prop({ required: true })
    title: string; // "Thi giữa kỳ", "Thi cuối kỳ", "Thi thử 1"

    @Prop({ type: Types.ObjectId, ref: 'ExamBank', required: true })
    bankId: Types.ObjectId; // Kho đề gốc

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    teacherId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Group', required: true })
    groupId: Types.ObjectId;

    @Prop({ type: Boolean, default: true })
    isPublic: boolean;

    @Prop({ type: Number, default: 10 })
    numChoice: number;

    @Prop({ type: Number, default: 45 })
    duration: number;

    @Prop({ type: Date })
    startTime: Date;

    @Prop({ type: Date })
    endTime: Date;

    @Prop({ type: Number, default: 1 })
    maxAttempts: number;

    @Prop({ type: String })
    code?: string; // Mã chung cho cả kỳ thi

    @Prop({ type: Boolean, default: false })
    isDeleted: boolean;

    @Prop({ type: String, enum: ['active', 'closed'], default: 'active' })
    status: string;

    @Prop({ type: Number, default: 0 })
    instanceCount: number;

}
export type ExamSessionDocument = ExamSession & Document;
export const ExamSessionSchema = SchemaFactory.createForClass(ExamSession);
