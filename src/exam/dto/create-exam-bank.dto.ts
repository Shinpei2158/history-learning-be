import { Grade } from '@/common/enums/grade';
import {
    IsEnum,
    IsOptional,
    IsString,
    ValidateNested,
    IsArray,
    IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

// ---------------- Trắc nghiệm ----------------
export class ExamQuestionDto {
    @IsOptional()
    @IsString()
    _id?: string;

    @IsString()
    question: string;

    @IsOptional()
    @IsArray()
    @Type(() => String)
    options?: string[];

    @IsOptional()
    @IsArray()
    @Type(() => Number)
    answers?: number[];
}

// ---------------- ExamBank ----------------
export class CreateExamBankDto {
    @IsString()
    title: string;

    @IsEnum(Grade)
    grade: Grade;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ExamQuestionDto)
    questions: ExamQuestionDto[];

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsBoolean()
    isPublished?: boolean;
}
