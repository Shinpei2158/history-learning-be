import { Controller, Get, Param, Post, Body, Patch, Delete, UseGuards } from '@nestjs/common';
import { HistoricalFigureService } from './historical-figure.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/user-role.enum';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('historical-figure')
export class HistoricalFigureController {
  constructor(private readonly historicalFigureService: HistoricalFigureService) { }

  // User: lấy danh sách nhân vật
  @Get()
  async getAll() {
    return this.historicalFigureService.getAll();
  }

  // User: lấy chi tiết 1 nhân vật
  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.historicalFigureService.getById(id);
  }

  // Admin: tạo mới nhân vật
  @Roles(UserRole.ADMIN)
  @Post()
  async create(@Body() data: any) {
    return this.historicalFigureService.create(data);
  }

  // Admin: cập nhật nhân vật
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.historicalFigureService.update(id, data);
  }

  // Admin: xóa nhân vật
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.historicalFigureService.delete(id);
  }
}
