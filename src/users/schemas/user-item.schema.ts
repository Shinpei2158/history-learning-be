import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema({ timestamps: true })
export class UserItem {
    @Prop({ type: Types.ObjectId, ref: "User", required: true })
    userId: Types.ObjectId;

    @Prop({ type: [Types.ObjectId], ref: "Avatar" })
    avatars: Types.ObjectId[];

    @Prop({ type: [Types.ObjectId], ref: "Frame" })
    frames: Types.ObjectId[];
}

export type UserItemDocument = UserItem & Document;
export const UserItemSchema = SchemaFactory.createForClass(UserItem)