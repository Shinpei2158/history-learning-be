import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class FlashcardLike {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Flashcard', required: true })
    flashcardId: Types.ObjectId;
}

export type FlashcardLikeDocument = FlashcardLike & Document;
export const FlashcardLikeSchema = SchemaFactory.createForClass(FlashcardLike);
