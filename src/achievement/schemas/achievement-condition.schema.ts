import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class AchievementCondition {
    @Prop({ type: String, required: true, unique: true })
    key: string;

    @Prop({ type: String })
    description?: string;
}

export type AchievementConditionDocument = AchievementCondition & Document;
export const AchievementConditionSchema = SchemaFactory.createForClass(AchievementCondition);
