// flashcard.controller.ts
import { Controller, Get, Req, Query, UseGuards, Param, Post, Body, Patch, Delete, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FlashcardService } from './flashcard.service';
import { Flashcard } from './schemas/flashcard.schema';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@/common/decorators/userId.decorator';
import { CreateFlashcardDto } from './dto/create-flashcard.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/user-role.enum';

@UseGuards(AuthGuard('jwt'))
@Controller('flashcards')
export class FlashcardController {
  constructor(private readonly flashcardService: FlashcardService) { }

  @Get()
  async getAll(@Query('grade') grade?: string): Promise<Flashcard[]> {
    return this.flashcardService.getAll(grade);
  }

  @Get('me')
  async getMyFlashcards(@User('sub') userId: string) {
    return this.flashcardService.getUserFlashcards(userId);
  }

  @Get(':id')
  async getOne(@Param('id') id: string): Promise<Flashcard> {
    return this.flashcardService.getById(id);
  }

  @Post(':id/progress')
  async updateProgress(
    @User('sub') userId: string,
    @Param('id') flashcardId: string,
    @Body() body: { currentIndex: number; completed?: boolean }
  ) {
    return this.flashcardService.updateProgress(userId, flashcardId, body);
  }

  @Post(':id/mark-question')
  async markQuestion(
    @User('sub') userId: string,
    @Param('id') flashcardId: string,
    @Body() body: { questionId: string; isRemembered: boolean }
  ) {
    return this.flashcardService.markQuestion(
      userId,
      flashcardId,
      body.questionId,
      body.isRemembered,
    );
  }

  @Get(':id/unremembered')
  async getUnremembered(
    @User('sub') userId: string,
    @Param('id') flashcardId: string,
  ) {
    return this.flashcardService.getUnrememberedQuestions(userId, flashcardId);
  }

  @Patch(':id/reset')
  async resetProgress(
    @User('sub') userId: string,
    @Param('id') flashcardId: string,
  ) {
    return this.flashcardService.resetProgress(userId, flashcardId);
  }

  @Post(':id/like')
  async toggleLike(
    @User('sub') userId: string,
    @Param('id') flashcardId: string,
  ) {
    return this.flashcardService.toggleLike(userId, flashcardId);
  }

  @Get(':id/like-count')
  async getLikeCount(@Param('id') flashcardId: string) {
    const count = await this.flashcardService.countLikes(flashcardId);
    return { likeCount: count };
  }

  @Get(':id/is-liked')
  async isLiked(
    @User('sub') userId: string,
    @Param('id') flashcardId: string,
  ) {
    return this.flashcardService.isLiked(userId, flashcardId);
  }

  @Get('me/likes')
  async getMyLikes(@User('sub') userId: string) {
    return this.flashcardService.getUserLikedFlashcards(userId);
  }

  @Post('upsert')
  async upsert(
    @User('sub') userId: string,
    @Body() dto: CreateFlashcardDto & { id?: string }
  ) {
    return this.flashcardService.upsertFlashcard(userId, dto);
  }

  @Delete(':id')
  async softDelete(@Param('id') id: string) {
    const deletedFlashcard = await this.flashcardService.softDelete(id);
    return { message: 'Xóa flashcard thành công', flashcard: deletedFlashcard };
  }

  @Roles(UserRole.TEACHER)
  @Post('import-excel')
  @UseInterceptors(FileInterceptor('file'))
  async importExcel(
    @User('sub') userId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: any,
  ) {
    if (!file) throw new BadRequestException('Vui lòng chọn file Excel');
    return this.flashcardService.importFlashcardExcel(userId, file.buffer, dto);
  }

}
