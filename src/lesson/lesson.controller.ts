import { Controller, Get, Param, Query } from '@nestjs/common';
import { LessonService } from './lesson.service';

@Controller('lessons')
export class LessonController {
  constructor(private readonly lessonService: LessonService) { }

  @Get()
  async getAll(
    @Query('grade') grade?: string,
    @Query('lastId') lastId?: string,
    @Query('limit') limit = 20,
  ) {
    return this.lessonService.getAll(grade, lastId, Number(limit));
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const lesson = await this.lessonService.getById(id);
    if (!lesson) {
      return { message: 'Không tìm thấy bài học' };
    }
    return lesson;
  }
}
