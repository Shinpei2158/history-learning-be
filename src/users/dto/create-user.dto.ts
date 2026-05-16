import { IsNotEmpty, IsString, IsEmail, MinLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../common/enums/user-role.enum';
import { Transform } from 'class-transformer';

export class CreateUserDto {
    @ApiProperty({ required: true })
    @IsNotEmpty()
    @IsString()
    username: string;

    @ApiProperty({ required: true })
    @IsEmail()
    email: string;

    @ApiProperty({ required: true })
    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @ApiProperty({ required: true })
    @IsNotEmpty()
    @IsString()
    fullName: string;

    @ApiProperty({ enum: UserRole, default: UserRole.STUDENT })
    @IsEnum(UserRole)
    @IsOptional()
    @Transform(({ value }) => value ?? UserRole.STUDENT)
    role?: UserRole;
}
