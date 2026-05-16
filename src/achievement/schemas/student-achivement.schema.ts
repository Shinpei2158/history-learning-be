import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types, Document } from "mongoose";

@Schema({ timestamps: true })
export class StudentAchievement {
    @Prop({ type: Types.ObjectId, ref: "User", required: true })
    studentId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "Achievement", required: true })
    achievementId: Types.ObjectId;

    // Tiến độ (vd: 5/10 bài học) (nếu progressCount >= achievement.threshold => isCompleted = true)
    @Prop({ type: Number, default: 0 })
    progressCount: number;

    // Đã hoàn thành chưa
    @Prop({ type: Boolean, default: false })
    isCompleted: boolean;

    // Ngày hoàn thành (nếu có)
    @Prop({ type: Date })
    completedAt: Date;

    @Prop({ type: Boolean, default: false })
    rewardClaimed: boolean
}

export type StudentAchievementDocument = StudentAchievement & Document;
export const StudentAchievementSchema =
    SchemaFactory.createForClass(StudentAchievement);

StudentAchievementSchema.index({ studentId: 1, achievementId: 1 }, { unique: true });