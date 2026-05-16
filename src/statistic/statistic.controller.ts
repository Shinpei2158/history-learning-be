import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { StatisticService } from './statistic.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@/common/decorators/userId.decorator';

@Controller('statistic')
@UseGuards(AuthGuard('jwt'))
export class StatisticController {
  constructor(private readonly statisticService: StatisticService) { }

  @Get('quiz')
  async getQuizStats(
    @User('sub') userId: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    // chuyển string -> number để dùng trong Date()
    const m = month ? parseInt(month) : undefined;
    const y = year ? parseInt(year) : undefined;
    return this.statisticService.getQuizStats(userId, m, y);
  }

  @Get('lesson')
  async getLessonStats(
    @User('sub') userId: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    // chuyển string -> number để dùng trong Date()
    const m = month ? parseInt(month) : undefined;
    const y = year ? parseInt(year) : undefined;
    return this.statisticService.getLessonStats(userId, m, y);
  }


}
