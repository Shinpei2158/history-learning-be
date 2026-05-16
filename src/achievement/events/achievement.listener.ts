import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { StudentAchievement, StudentAchievementDocument } from "../schemas/student-achivement.schema";
import { Model, Types } from "mongoose";
import { Achievement, AchievementDocument } from "../schemas/achievement.schema";
import { OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class AchievementEventListener {
    private readonly logger = new Logger(AchievementEventListener.name);
    constructor(
        @InjectModel(Achievement.name)
        private readonly achievementModel: Model<AchievementDocument>,

        @InjectModel(StudentAchievement.name)
        private readonly studentAchievementModel: Model<StudentAchievementDocument>,
    ) { }

    @OnEvent("lesson-completed")
    async handleLessonCompleted(payload: { studentId: string }) {
        await this.updateProgress(payload.studentId, "lesson-completed-count");
    }

    @OnEvent("friendship-accepted")
    async handleFriendshipAccepted(payload: { userA: string; userB: string }) {
        await Promise.all([
            this.updateProgress(payload.userA, "friend-count", 1),
            this.updateProgress(payload.userB, "friend-count", 1),
        ]);
    }

    @OnEvent("friendship-removed")
    async handleFriendshipRemoved(payload: { userA: string; userB: string }) {
        await Promise.all([
            this.updateProgress(payload.userA, "friend-count", -1),
            this.updateProgress(payload.userB, "friend-count", -1),
        ]);
    }

    @OnEvent("flashcard-liked")
    async handleFlashcardLiked(payload: { userId: string }) {
        await this.updateProgress(payload.userId, "flashcard-liked-count", 1);
    }

    @OnEvent("flashcard-created")
    async handleFlashcardCreated(payload: { userId: string }) {
        await this.updateProgress(payload.userId, "flashcard-created-count", 1)
    }

    @OnEvent("quiz-completed")
    async handleQuizCompleted(payload: { userId: string }) {
        await this.updateProgress(payload.userId, "quiz-completed-count", 1)
    }

    private async updateProgress(studentId: string, key: string, increment = 1) {
        this.logger.log(`[${key}] for student ${studentId}`);
        const achievements = await this.achievementModel
            .find()
            .populate("condition", "key")
            .lean()

        const related = achievements.filter((a) => a.condition.key === key);

        if (!related.length) return;

        for (const achievement of related) {
            const sa = await this.studentAchievementModel.findOne({
                studentId: new Types.ObjectId(studentId),
                achievementId: achievement._id
            });

            if (!sa) continue;

            //Nếu chưa hoàn thành
            if (!sa.isCompleted) {
                sa.progressCount += increment;

                if (sa.progressCount >= achievement.threshold) {
                    sa.isCompleted = true;
                    sa.completedAt = new Date()
                }
                await sa.save();
            }
        }
    }
}