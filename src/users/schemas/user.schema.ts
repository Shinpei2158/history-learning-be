import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserRole } from '../../common/enums/user-role.enum';

@Schema({ timestamps: true })
export class User {
    @Prop({ required: true, unique: true })
    username: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop()
    fullName: string;

    @Prop({ enum: UserRole, default: UserRole.STUDENT })
    role: UserRole;

    @Prop({ default: false })
    isEmailVerified: boolean;

    @Prop()
    emailVerificationToken: string;

    @Prop()
    passwordResetToken: string;

    @Prop()
    passwordResetExpires: Date;

    @Prop()
    refreshToken: string;

    @Prop({ default: true })
    isActive: boolean;

    @Prop()
    lastLogin: Date;

    @Prop({ type: Types.ObjectId, ref: "Avatar" })
    avatar: Types.ObjectId

    @Prop({ type: Types.ObjectId, ref: "Frame" })
    frame: Types.ObjectId;

    @Prop({ default: 0 })
    point: number;

    @Prop({ default: 0 })
    exp: number
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);