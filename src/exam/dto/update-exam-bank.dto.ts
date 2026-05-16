import { PartialType } from '@nestjs/swagger';
import { CreateExamBankDto } from './create-exam-bank.dto';

export class UpdateExamBankDto extends PartialType(CreateExamBankDto) { }
