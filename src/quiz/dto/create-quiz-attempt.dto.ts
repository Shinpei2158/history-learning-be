import { IsMongoId, IsNumber, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class CreateQuizAttemptDto {
    @IsMongoId()
    flashcardId: Types.ObjectId;

    @IsNumber()
    score: number;

    @IsNumber()
    correctCount: number;

    @IsNumber()
    totalQuestions: number;

    @IsOptional()
    @IsNumber()
    timeSpent?: number;
}
