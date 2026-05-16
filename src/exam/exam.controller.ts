import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '@/common/decorators/roles.decorator';
import { User } from '@/common/decorators/userId.decorator';
import { UserRole } from '@/common/enums/user-role.enum';

import { CreateExamBankDto } from './dto/create-exam-bank.dto';
import { ExamService } from './exam.service';

@UseGuards(AuthGuard('jwt'))
@Controller('exam')
export class ExamController {
  constructor(private readonly examService: ExamService) { }

  /** Tạo hoặc cập nhật kho đề */
  @Post('upsert')
  @Roles(UserRole.TEACHER)
  @HttpCode(HttpStatus.OK)
  async upsert(
    @User('sub') teacherId: string,
    @Body() dto: CreateExamBankDto & { id?: string },
  ) {
    return await this.examService.upsertExamBank(teacherId, dto);
  }

  /** Xóa kho đề (soft delete) */
  @Delete(':id')
  @Roles(UserRole.TEACHER)
  async remove(@Param('id') id: string, @User('sub') teacherId: string) {
    return await this.examService.removeExamBank(id, teacherId);
  }

  /** Lấy danh sách kho đề của giáo viên */
  @Get('me')
  @Roles(UserRole.TEACHER)
  async findTeacherBanks(@User('sub') teacherId: string) {
    return await this.examService.getTeacherBanks(teacherId);
  }

  /** Lấy chi tiết kho đề (ai cũng có thể xem, nếu được public) */
  @Get(':id')
  async getExamBankDetail(@Param('id') id: string) {
    return await this.examService.getExamBankById(id);
  }

  @Post('create-session')
  @Roles(UserRole.TEACHER)
  async createSession(
    @User('sub') teacherId: string,
    @Body() dto: any,
  ) {
    return this.examService.createExamFromBank(teacherId, dto);
  }

  @Get("group/:groupId")
  async getGroupSessions(@Param("groupId") groupId: string) {
    return this.examService.getSessionsByGroup(groupId);
  }

  @Get("group/:groupId/available")
  @Roles(UserRole.STUDENT)
  async getAvailableExams(
    @Param("groupId") groupId: string,
  ) {
    return this.examService.getAvailableExamsForStudent(groupId);
  }

  @Post("exam-sessions/:sessionId/start")
  @Roles(UserRole.STUDENT)
  async startExam(@Param("sessionId") sessionId: string, @User('sub') studentId: string) {
    return this.examService.startExam(sessionId, studentId);
  }

  @Get('exam-attempts/:attemptId')
  @Roles(UserRole.STUDENT)
  async getAttemptDetail(
    @Param('attemptId') attemptId: string,
    @User('sub') studentId: string,
  ) {
    return this.examService.getAttemptDetail(attemptId, studentId);
  }

  @Patch("exam-attempts/:attemptId/submit")
  @Roles(UserRole.STUDENT)
  async sumbitExam(@Param("attemptId") attemptId: string, @Body() body: any, @User('sub') studentId: string) {
    return this.examService.submitExam(attemptId, body, studentId);
  }

}
