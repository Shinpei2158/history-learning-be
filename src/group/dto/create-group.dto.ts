import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateGroupDto {
    @IsString()
    @IsNotEmpty({ message: "Tên nhóm không được trống" })
    @MaxLength(100, { message: "Tên nhóm tối đa 100 ký tự" })
    name: string;

    @IsString()
    @IsOptional()
    @MaxLength(500, { message: "Mô tả nhóm tối đa 500 ký tự" })
    description?: string;
}
