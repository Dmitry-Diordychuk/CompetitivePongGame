import {Controller, Get, Param, ParseIntPipe, UsePipes} from "@nestjs/common";
import {AchievementService} from "@app/achievement/achievement.service";
import {AchievementsResponseInterface} from "@app/achievement/type/achievementsResponse.interface";
import {AchievementResponseInterface} from "@app/achievement/type/achievementResponse.interface";

@Controller("api/achievement")
export class AchievementController {
    constructor(private readonly achievementService: AchievementService) {}

    @Get('all')
    async getAllAchievements(): Promise<AchievementsResponseInterface> {
        return await this.achievementService.getAllAchievements();
    }

    @UsePipes(new ParseIntPipe())
    @Get(':id')
    async getAchievementById(
        @Param('id') achievement_id: number
    ): Promise<AchievementResponseInterface> {
        return await this.achievementService.getAchievementById(achievement_id);
    }
}