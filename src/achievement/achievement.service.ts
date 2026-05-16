import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Achievement, AchievementDocument } from "./schemas/achievement.schema";
import { StudentAchievement, StudentAchievementDocument } from "./schemas/student-achivement.schema";
import { User, UserDocument } from "@/users/schemas/user.schema";

@Injectable()
export class AchievementService {
  constructor(
    @InjectModel(Achievement.name)
    private readonly achievementModel: Model<AchievementDocument>,

    @InjectModel(StudentAchievement.name)
    private readonly studentAchievementModel: Model<StudentAchievementDocument>,

    @InjectModel(User.name) private readonly userModel: Model<UserDocument>
  ) { }

  async getAllWithProgress(studentId: string) {
    return await this.studentAchievementModel
      .find({ studentId: new Types.ObjectId(studentId) })
      .populate({
        path: "achievementId",
        select: "name description threshold reward condition isActive",
      })
      .lean();
  }

  async claimReward(studentId: string, achievementId: string) {
    const studentObjId = new Types.ObjectId(studentId);
    const achievementObjId = new Types.ObjectId(achievementId);

    const studentAchievement = await this.studentAchievementModel.findOne({
      studentId: studentObjId,
      achievementId: achievementObjId,
    });

    if (!studentAchievement)
      throw new BadRequestException("Thành tựu không tồn tại.");

    if (!studentAchievement.isCompleted)
      throw new BadRequestException("Thành tựu chưa hoàn thành.");

    if (studentAchievement.rewardClaimed)
      throw new BadRequestException("Phần thưởng đã được nhận trước đó.");

    // Lấy thông tin phần thưởng từ achievement
    const achievement = await this.achievementModel.findById(achievementObjId);
    const rewardPoint = achievement.reward.point || 0;
    const rewardExp = achievement.reward.exp || 0;

    // Cộng điểm và exp cho user
    await this.userModel.findByIdAndUpdate(studentObjId, {
      $inc: { exp: rewardExp, point: rewardPoint },
    });

    // Đánh dấu đã nhận thưởng
    studentAchievement.rewardClaimed = true;
    await studentAchievement.save();

    return {
      message: "Nhận thưởng thành công!",
      reward: { exp: rewardExp, point: rewardPoint },
    };
  }
}
