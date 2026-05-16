
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { AchievementCondition } from "./achievement-condition.schema";

@Schema({ timestamps: true })
export class Achievement {
    @Prop({ type: String, required: true })
    name: string

    @Prop({ type: String })
    description: string

    @Prop({ type: Types.ObjectId, ref: "AchievementCondition", required: true })
    condition: AchievementCondition;

    @Prop({ type: Number, required: true })
    threshold: number;

    @Prop({
        type: {
            point: { type: Number, default: 0 },
            exp: { type: Number, default: 0 },
        },
        default: {},
    })
    reward: {
        point?: number;
        exp?: number;
    };
    @Prop({ type: Boolean, default: true })
    isActive: boolean
}

export type AchievementDocument = Document & Achievement;
export const AchievementSchema = SchemaFactory.createForClass(Achievement)