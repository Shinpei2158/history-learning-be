import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: true })
export class Avatar {
    @Prop({ type: String, required: true })
    name: string;

    @Prop({ type: String })
    description?: string

    @Prop({ enum: ["free", "rare", "legendary"], default: "free" })
    type: string

    @Prop({ type: Number, default: 0 })
    price?: number;
}

export type AvatarDocument = Avatar & Document;
export const AvatarSchema = SchemaFactory.createForClass(Avatar);