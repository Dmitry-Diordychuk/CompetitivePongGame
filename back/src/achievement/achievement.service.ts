import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {AchievementEntity} from "@app/achievement/achievement.entity";
import {Repository} from "typeorm";
import {AchievementsResponseInterface} from "@app/achievement/type/achievementsResponse.interface";
import {AchievementResponseInterface} from "@app/achievement/type/achievementResponse.interface";

@Injectable()
export class AchievementService {
    constructor(
        @InjectRepository(AchievementEntity) private readonly achievementRepository: Repository<AchievementEntity>
    ) {}

    async getAllAchievements(): Promise<AchievementsResponseInterface> {
        const achievements = await this.achievementRepository.find();
        const counter = achievements.length;
        return {
            achievements,
            counter
        }
    }

    async getAchievementById(achievement_id: number): Promise<AchievementResponseInterface> {
        const achievement = await this.achievementRepository.findOne(achievement_id);
        return {
            achievement
        }
    }

    async findAchievementById(achievementId: number): Promise<AchievementEntity> {
        const achievement = await this.achievementRepository.findOne(achievementId);
        if (!achievement) {
            throw new HttpException("There is no such achievement", HttpStatus.BAD_REQUEST);
        }
        return achievement;
    }

    async createAchievement(title: string, description: string): Promise<AchievementResponseInterface> {
        let achievement = new AchievementEntity();
        achievement.title = title;
        achievement.description = description;
        return {
            achievement: await this.achievementRepository.save(achievement),
        }
    }
}