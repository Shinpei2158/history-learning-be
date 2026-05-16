import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Group, GroupDocument } from './schemas/group.schema';
import { GroupMember, GroupMemberDocument } from './schemas/group-member.schema';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { User, UserDocument } from '@/users/schemas/user.schema';

@Injectable()
export class GroupService {
  constructor(
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
    @InjectModel(GroupMember.name) private groupMemberModel: Model<GroupMemberDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) { }

  private generateInviteCode(length = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }

  /** Teacher tạo nhóm */
  async createGroup(teacherId: string, dto: CreateGroupDto) {
    const inviteCode = this.generateInviteCode();

    const group = await this.groupModel.create({
      ...dto,
      teacherId: new Types.ObjectId(teacherId),
      inviteCode
    });

    // Tạo luôn member record cho teacher
    await this.groupMemberModel.create({
      groupId: group._id,
      memberId: new Types.ObjectId(teacherId),
      isAccepted: true,
    });

    return group;
  }

  /** Teacher sửa nhóm */
  async updateGroup(groupId: string, teacherId: string, dto: UpdateGroupDto) {
    const group = await this.groupModel.findById(new Types.ObjectId(groupId));
    if (!group) throw new NotFoundException('Không tìm thấy nhóm');
    if (!group.teacherId.equals(new Types.ObjectId(teacherId)))
      throw new ForbiddenException('Chỉ giáo viên tạo nhóm mới có thể sửa');

    // Chỉ update name, description
    if (dto.name) group.name = dto.name;
    if (dto.description !== undefined) group.description = dto.description;

    await group.save();
    return group;
  }

  /** Teacher xóa nhóm (soft delete) */
  async removeGroup(groupId: string, teacherId: string) {
    const group = await this.groupModel.findById(new Types.ObjectId(groupId));
    if (!group) throw new NotFoundException('Không tìm thấy nhóm');
    if (!group.teacherId.equals(new Types.ObjectId(teacherId)))
      throw new ForbiddenException('Chỉ giáo viên tạo nhóm mới có thể xóa');

    group.isActive = false;
    await group.save();
    return { message: 'Nhóm đã được xóa (ẩn)', groupId };
  }

  /** Lấy danh sách tất cả nhóm user đã tham gia (teacher/student) */
  async findAllGroups(userId: string) {
    const userOid = new Types.ObjectId(userId);

    // Tìm tất cả membership được duyệt (cả teacher và student đều có)
    const memberships = await this.groupMemberModel
      .find({ memberId: userOid, isAccepted: true })
      .lean();

    const groupIds = memberships.map((m) => m.groupId);

    // Lấy các nhóm đang hoạt động
    const groups = await this.groupModel.find({ _id: { $in: groupIds }, isActive: true }).lean();

    // Gắn thông tin (admin + số lượng member cho mỗi group)
    const populateGroups = await Promise.all(
      groups.map(async (g) => {
        const [teacher, membersCount] = await Promise.all([
          this.userModel.findById(g.teacherId, 'fullName username avatar').lean(),
          this.groupMemberModel.countDocuments({
            groupId: g._id,
            isAccepted: true,
          })
        ])
        return {
          ...g, teacher, membersCount
        }
      })
    )
    return populateGroups;
  }


  async requestJoinGroup(studentId: string, inviteCode: string) {
    if (!inviteCode) throw new BadRequestException('Thiếu mã mời');

    const group = await this.groupModel.findOne({ inviteCode, isActive: true });
    if (!group) throw new NotFoundException('Không tìm thấy nhóm hoặc nhóm đã bị ẩn');

    // Kiểm tra đã là thành viên chưa
    const existingMember = await this.groupMemberModel.findOne({
      groupId: group._id,
      memberId: new Types.ObjectId(studentId),
    });
    if (existingMember) {
      if (existingMember.isAccepted)
        throw new BadRequestException('Bạn đã ở trong nhóm này');
      else throw new BadRequestException('Bạn đã gửi yêu cầu và đang chờ duyệt');
    }

    // Tạo record chờ duyệt
    await this.groupMemberModel.create({
      groupId: group._id,
      memberId: new Types.ObjectId(studentId),
      isAccepted: false,
    });

    return { message: 'Gửi yêu cầu tham gia thành công, vui lòng chờ duyệt' };
  }

  /** Teacher xem danh sách yêu cầu chờ duyệt của nhóm */
  async getPendingRequests(groupId: string, teacherId: string) {
    const group = await this.groupModel.findById(groupId);
    if (!group) throw new NotFoundException('Không tìm thấy nhóm');
    if (!group.teacherId.equals(new Types.ObjectId(teacherId)))
      throw new ForbiddenException('Bạn không có quyền xem yêu cầu nhóm này');

    // Lấy danh sách học sinh đang chờ
    const pendingMembers = await this.groupMemberModel
      .find({ groupId: group._id, isAccepted: false })
      .populate('memberId', 'fullName username email')

    return pendingMembers.map((m) => ({
      _id: m._id,
      student: m.memberId,
      joinedAt: m.createdAt,
    }));
  }

  /** Teacher duyệt hoặc từ chối yêu cầu tham gia nhóm */
  async handleJoinRequest(
    teacherId: string,
    memberRecordId: string,
    action: 'accept' | 'reject',
  ) {
    const memberRecord = await this.groupMemberModel.findById(memberRecordId);
    if (!memberRecord) throw new NotFoundException('Không tìm thấy yêu cầu này');

    const group = await this.groupModel.findById(memberRecord.groupId);
    if (!group) throw new NotFoundException('Không tìm thấy nhóm');
    if (!group.teacherId.equals(new Types.ObjectId(teacherId)))
      throw new ForbiddenException('Bạn không có quyền xử lý nhóm này');

    if (memberRecord.isAccepted)
      throw new BadRequestException('Yêu cầu này đã được duyệt trước đó');

    if (action === 'accept') {
      memberRecord.isAccepted = true;
      await memberRecord.save();
      return { message: 'Đã chấp nhận yêu cầu tham gia nhóm' };
    } else if (action === 'reject') {
      await memberRecord.deleteOne();
      return { message: 'Đã từ chối yêu cầu tham gia nhóm' };
    } else {
      throw new BadRequestException('Hành động không hợp lệ');
    }
  }

  /** Lấy danh sách thành viên trong nhóm (đã được duyệt) */
  async getAcceptedMembers(groupId: string, userId: string) {
    const group = await this.groupModel.findById(groupId);
    if (!group) throw new NotFoundException('Không tìm thấy nhóm');

    const members = await this.groupMemberModel
      .find({ groupId: group._id, isAccepted: true })
      .populate('memberId', 'fullName username email');

    return {
      teacherId: group.teacherId,
      members: members.map((m) => ({
        _id: m._id,
        student: m.memberId,
        joinedAt: m.createdAt,
      })),
    };
  }

  async getGroupDetail(groupId: string) {
    const group = await this.groupModel
      .findById(groupId)
      .populate('teacherId', 'fullName username email')
      .lean();
    if (!group) throw new NotFoundException('Không tìm thấy nhóm');

    const membersCount = await this.groupMemberModel.countDocuments({
      groupId,
      isAccepted: true,
    });

    return { ...group, membersCount };
  }
  async getPendingGroups(studentId: string) {
    const members = await this.groupMemberModel
      .find({
        memberId: new Types.ObjectId(studentId),
        isAccepted: false,
      })
      .populate({
        path: "groupId",
        match: { isActive: true },
        select: "name description teacherId isActive",
        populate: {
          path: "teacherId",
          select: "fullName username avatar",
        },
      })
      .lean();

    // Lấy groupId hợp lệ, map an toàn sang teacher
    const groups = members
      .map((m) => m.groupId)
      .filter((g) => !!g) // loại null/undefined
      .map((g: any) => {
        const teacher = g?.teacherId ?? g?.teacher ?? null;
        const { teacherId, ...rest } = g;

        return {
          ...rest,
          teacher,
        };
      });

    return groups;
  }


  async leaveOrCancelRequest(groupId: string, studentId: string) {
    const member = await this.groupMemberModel.findOne({
      groupId: new Types.ObjectId(groupId),
      memberId: new Types.ObjectId(studentId),
    });

    if (!member) {
      throw new NotFoundException('Không tìm thấy yêu cầu tham gia hoặc thành viên trong nhóm này.');
    }

    await this.groupMemberModel.deleteOne({ _id: member._id });

    return {
      message: member.isAccepted
        ? 'Đã rời nhóm thành công.'
        : 'Đã hủy yêu cầu tham gia nhóm.',
    };
  }


}
