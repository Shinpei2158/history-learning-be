import { IsNotEmpty, IsString, Length } from 'class-validator';

export class JoinGroupDto {
    @IsString()
    @IsNotEmpty()
    @Length(6, 6)
    inviteCode: string;
}
