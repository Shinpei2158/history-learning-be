import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { LessonLearnService } from './lesson-learn.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@/common/decorators/userId.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('lesson-learn')
export class LessonLearnController {
  constructor(private readonly lessonLearnService: LessonLearnService) { }

  // Lấy danh sách tiến độ của user
  @Get('me')
  async getUserLessons(@User('sub') userId: string) {
    return this.lessonLearnService.getUserLessons(userId);
  }

  // Lấy danh sách các lesson mà user đã hoàn thành
  @Get('completed')
  async getCompleted(@User('sub') userId: string) {
    return this.lessonLearnService.getCompletedLessons(userId);
  }

  // Lấy tiến độ của 1 bài học
  @Get('lesson/:lessonId')
  async getProgress(
    @User('sub') userId: string,
    @Param('lessonId') lessonId: string,
  ) {
    return this.lessonLearnService.getProgress(userId, lessonId);
  }

  // Cập nhật điểm (sau khi làm bài xong)
  @Post(':lessonId/update')
  async updateProgress(
    @User('sub') userId: string,
    @Param('lessonId') lessonId: string,
    @Body() body: { score: number, timeSpent: number },
  ) {
    return this.lessonLearnService.updateProgress(userId, lessonId, body.score, body.timeSpent);
  }

  // Reset tiến độ học
  @Patch(':lessonId/reset')
  async resetProgress(
    @User('sub') userId: string,
    @Param('lessonId') lessonId: string,
  ) {
    return this.lessonLearnService.resetProgress(userId, lessonId);
  }

}
