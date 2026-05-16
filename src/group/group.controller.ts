import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, BadRequestException } from '@nestjs/common';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@/common/decorators/userId.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/user-role.enum';

@UseGuards(AuthGuard('jwt'))
@Controller('group')
export class GroupController {
  constructor(private readonly groupService: GroupService) { }

  /** Teacher tạo nhóm */
  @Post()
  @Roles(UserRole.TEACHER)
  async create(@Body() dto: CreateGroupDto, @User('sub') teacherId: string) {
    return this.groupService.createGroup(teacherId, dto);
  }

  /** Teacher sửa nhóm */
  @Patch(':id')
  @Roles(UserRole.TEACHER)
  async update(
    @Param('id') groupId: string,
    @User('sub') teacherId: string,
    @Body() dto: UpdateGroupDto,
  ) {
    return this.groupService.updateGroup(groupId, teacherId, dto);
  }

  /** Teacher xóa nhóm (soft delete) */
  @Delete(':id')
  @Roles(UserRole.TEACHER)
  async remove(@Param('id') groupId: string, @User('sub') teacherId: string) {
    return this.groupService.removeGroup(groupId, teacherId);
  }

  /** Lấy danh sách tất cả nhóm đã tham gia (teacher/student dùng chung) */
  @Get()
  async findAllForUser(@User('sub') userId: string) {
    const result = this.groupService.findAllGroups(userId);
    console.log(result);
    return result;
  }

  // Gửi yêu cầu tham gia nhóm
  @Roles(UserRole.STUDENT)
  @Post('join')
  async requestJoinGroup(@User('sub') studentId: string, @Body('inviteCode') inviteCode: string) {
    return await this.groupService.requestJoinGroup(studentId, inviteCode);
  }

  // Lấy danh sách yêu cầu tham gia nhóm
  @Roles(UserRole.TEACHER)
  @Get(':groupId/pending')
  async getPendingRequests(@User('sub') teacherId: string, @Param('groupId') groupId: string) {
    return await this.groupService.getPendingRequests(groupId, teacherId);
  }

  // Xử lí yêu cầu (đồng ý, từ chối tham gia nhóm)
  @Roles(UserRole.TEACHER)
  @Post('request/:memberRecordId')
  async handleJoinRequest(
    @User('sub') teacherId: string,
    @Param('memberRecordId') memberRecordId: string,
    @Body('action') action: 'accept' | 'reject',
  ) {
    return await this.groupService.handleJoinRequest(teacherId, memberRecordId, action);
  }

  @Get('pending')
  async getPendingGroups(@User('sub') studentId: string) {
    return this.groupService.getPendingGroups(studentId);
  }

  // Lấy thông tin chung của nhóm
  @Get(':id')
  async getGroupDetail(@Param('id') groupId: string) {
    return this.groupService.getGroupDetail(groupId);
  }

  // Lấy danh sách thành viên
  @Get(':groupId/members')
  async getAcceptedMembers(@User('sub') userId: string, @Param('groupId') groupId: string) {
    return await this.groupService.getAcceptedMembers(groupId, userId);
  }

  @Delete(':groupId/leave')
  async leaveOrCancelRequest(
    @Param('groupId') groupId: string,
    @User('sub') studentId: string,
  ) {
    return this.groupService.leaveOrCancelRequest(groupId, studentId);
  }



}
