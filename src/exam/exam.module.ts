import { Module } from '@nestjs/common';
import { ExamService } from './exam.service';
import { ExamController } from './exam.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ExamBank, ExamBankSchema } from './schemas/exam-bank.schema';
import { ExamSession, ExamSessionSchema } from './schemas/exam-session.schema';
import { ExamInstance, ExamInstanceSchema } from './schemas/exam-instance.schema';
import { ExamAttempt, ExamAttemptSchema } from './schemas/exam-attempt.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ExamBank.name, schema: ExamBankSchema },
      { name: ExamSession.name, schema: ExamSessionSchema },
      { name: ExamInstance.name, schema: ExamInstanceSchema },
      { name: ExamAttempt.name, schema: ExamAttemptSchema }
    ]),
  ],
  controllers: [ExamController],
  providers: [ExamService],
})
export class ExamModule { }
