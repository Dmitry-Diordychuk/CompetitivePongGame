import {AchievementEntity} from "@app/achievement/achievement.entity";

export class AchievementsResponseInterface {
    achievements: AchievementEntity[]
    achievementCounter: number
}