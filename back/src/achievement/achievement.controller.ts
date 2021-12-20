import {Controller, Get, Param, ParseIntPipe, UseGuards, UsePipes} from "@nestjs/common";
import {AchievementService} from "@app/achievement/achievement.service";
import {AchievementsResponseInterface} from "@app/achievement/type/achievementsResponse.interface";
import {AchievementResponseInterface} from "@app/achievement/type/achievementResponse.interface";
import Role from "@app/user/types/role.enum";
import RoleGuard from "@app/shared/guards/role.guard";

@Controller("api/achievement")
@UseGuards(RoleGuard(Role.User))
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