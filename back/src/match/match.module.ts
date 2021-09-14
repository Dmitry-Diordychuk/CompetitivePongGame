import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {AchievementController} from "@app/achievement/achievement.controller";
import {AchievementService} from "@app/achievement/achievement.service";
import {AchievementEntity} from "@app/achievement/achievement.entity";

@Module({
    imports: [TypeOrmModule.forFeature([AchievementEntity])],
    controllers: [AchievementController],
    providers: [AchievementService]
})
export class MatchModule {}