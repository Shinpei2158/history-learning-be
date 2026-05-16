import { IsString, IsMongoId, IsOptional, IsBoolean, IsNumber, IsDateString, Min } from 'class-validator';

export class CreateExamSessionDto {
    @IsString()
    title: string; // Tên kỳ thi (VD: "Thi giữa kỳ", "Thi cuối kỳ")

    @IsMongoId()
    bankId: string; // ID kho đề gốc

    @IsMongoId()
    groupId: string; // Nhóm lớp

    @IsNumber()
    @Min(1)
    instanceCount: number; // Số đề cần tạo (VD: 5)

    @IsNumber()
    @Min(1)
    numChoice: number; // Số câu trắc nghiệm mỗi đề

    @IsNumber()
    @Min(0)
    numEssay: number; // Số câu tự luận mỗi đề

    @IsNumber()
    @Min(1)
    duration: number; // Thời lượng (phút)

    @IsOptional()
    @IsDateString()
    startTime?: Date; // Ngày giờ bắt đầu thi

    @IsOptional()
    @IsDateString()
    endTime?: Date; // Ngày giờ kết thúc thi

    @IsOptional()
    @IsNumber()
    @Min(1)
    maxAttempts?: number; // Số lần làm tối đa

    @IsOptional()
    @IsString()
    code?: string; // Mã chung (nếu có)

    @IsOptional()
    @IsBoolean()
    isPublic?: boolean; // Công khai hay không
}
