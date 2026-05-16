import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { QuizAttemptService } from './quiz-attempt.service';
import { CreateQuizAttemptDto } from './dto/create-quiz-attempt.dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@/common/decorators/userId.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('quiz-attempts')
export class QuizAttemptController {
  constructor(private readonly quizAttemptService: QuizAttemptService) { }

  @Post()
  async create(@User('sub') userId: string, @Body() dto: CreateQuizAttemptDto) {
    return this.quizAttemptService.create(userId, dto);
  }

  @Get()
  async findAll(@User('sub') userId: string) {
    return this.quizAttemptService.findAllByUser(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.quizAttemptService.findOne(id);
  }
}
