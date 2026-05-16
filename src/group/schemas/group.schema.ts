import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Group {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    teacherId: Types.ObjectId;

    @Prop({ required: true })
    name: string;

    @Prop()
    description?: string;

    @Prop({ unique: true })
    inviteCode?: string;

    @Prop({ default: true })
    isActive: boolean;
}

export type GroupDocument = Group & Document;
export const GroupSchema = SchemaFactory.createForClass(Group);
