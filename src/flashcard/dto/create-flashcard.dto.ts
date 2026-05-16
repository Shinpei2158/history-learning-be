import { IsString, IsArray, IsBoolean, IsEnum, ValidateNested, IsOptional, IsNumber, ArrayNotEmpty, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { Grade } from '@/common/enums/grade';

class QuestionDto {
    @IsOptional()
    @IsString()
    _id?: string;

    @IsString()
    question: string;

    @IsArray()
    @ArrayNotEmpty()
    @ArrayMinSize(2)
    @IsString({ each: true })
    options: string[];

    @IsArray()
    @ArrayNotEmpty()
    @IsNumber({}, { each: true })
    answer: number[]; // lưu index các đáp án đúng
}

export class CreateFlashcardDto {
    @IsString()
    title: string;

    @IsEnum(Grade)
    grade: Grade;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsBoolean()
    isPublished?: boolean;

    @IsOptional()
    @IsEnum(["single", "multiple"])
    type?: string; // single choice hoặc multiple choice

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => QuestionDto)
    questions: QuestionDto[];
}
