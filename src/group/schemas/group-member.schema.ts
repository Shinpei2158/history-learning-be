import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class GroupMember {
    @Prop({ type: Types.ObjectId, ref: 'Group', required: true })
    groupId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    memberId: Types.ObjectId;

    @Prop({ default: false })
    isAccepted: boolean

    createdAt?: Date;
    updatedAt?: Date;
}

export type GroupMemberDocument = GroupMember & Document;
export const GroupMemberSchema = SchemaFactory.createForClass(GroupMember);
