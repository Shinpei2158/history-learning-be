import { Controller, Get, UseGuards, Param, Post } from "@nestjs/common";
import { AchievementService } from "./achievement.service";
import { AuthGuard } from "@nestjs/passport";
import { User } from "@/common/decorators/userId.decorator";
import { Roles } from "@/common/decorators/roles.decorator";
import { UserRole } from "@/common/enums/user-role.enum";

@UseGuards(AuthGuard("jwt"))
@Controller("achievements")
export class AchievementController {
  constructor(private readonly achievementService: AchievementService) { }

  @Get("me")
  @Roles(UserRole.STUDENT)
  async getAchievementsForStudent(@User('sub') studentId: string) {
    return this.achievementService.getAllWithProgress(studentId);
  }

  @Post(":id/claim")
  @Roles(UserRole.STUDENT)
  async claimReward(@User('sub') studentId: string, @Param('id') achievementId: string) {
    return this.achievementService.claimReward(studentId, achievementId)
  }

}
