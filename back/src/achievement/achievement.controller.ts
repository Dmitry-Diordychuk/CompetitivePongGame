import {Controller, Get, Param} from "@nestjs/common";
import {AchievementService} from "@app/achievement/achievement.service";

@Controller("api/achievement")
export class AchievementController {
    constructor(private readonly achievementService: AchievementService) {}

    @Get('all')
    async getAllAchievements() {
        return await this.achievementService.getAllAchievements();
    }

    @Get(':id')
    async getAchievementById(@Param('id') achievement_id: number) {
        return await this.achievementService.getAchievementById(achievement_id);
    }
}