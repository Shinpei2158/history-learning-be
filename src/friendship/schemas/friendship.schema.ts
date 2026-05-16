import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { User } from "@/users/schemas/user.schema";
import { FriendshipStatus } from "@/common/enums/friendship-status.enum";

@Schema({ timestamps: true })
export class Friendship {
    @Prop({ type: Types.ObjectId, ref: "User", required: true })
    userId: User | Types.ObjectId; // người gửi lời mời

    @Prop({ type: Types.ObjectId, ref: "User", required: true })
    friendId: User | Types.ObjectId; // người nhận

    @Prop({ enum: FriendshipStatus, default: FriendshipStatus.PENDING })
    status: FriendshipStatus; // trạng thái (pending / accepted / rejected)
}

export type FriendshipDocument = Friendship & Document;
export const FriendshipSchema = SchemaFactory.createForClass(Friendship);
