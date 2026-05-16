import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: true })
export class Frame {
    @Prop({ type: String, required: true })
    name: string;

    @Prop({ type: String })
    description?: string;

    @Prop({ enum: ["free", "rare", "legendary"], default: "free" })
    type: string

    @Prop({ type: Number, default: 0 })
    price?: number;
}

export type FrameDocument = Frame & Document;
export const FrameSchema = SchemaFactory.createForClass(Frame);