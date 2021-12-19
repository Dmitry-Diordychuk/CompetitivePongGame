import {InjectRepository} from "@nestjs/typeorm";
import {UserEntity} from "@app/user/user.entity";
import {Repository} from "typeorm";
import {ProfileResponseInterface} from "@app/profile/type/profileResponse.interface";
import {ProfileEntity} from "@app/profile/profile.entity";
import {HttpException, HttpStatus} from "@nestjs/common";
import {MatchService} from "@app/match/match.service";
import {AchievementService} from "@app/achievement/achievement.service";

export class ProfileService {
    constructor(
        private readonly matchService: MatchService,
        private readonly achievementService: AchievementService,
        @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
        @InjectRepository(ProfileEntity) private readonly profileRepository: Repository<ProfileEntity>
    ) {}

    async getCurrentUserWithProfile(currentUserId: number): Promise<UserEntity> {
        return await this.userRepository.findOne(currentUserId, { relations: ["profile"] });
    }

    async getUserWithProfileById(profileId: number): Promise<UserEntity> {
        const profile = await this.profileRepository.findOne(profileId);

        if (!profile) {
            throw new HttpException("Profile doesn't exist", HttpStatus.NOT_FOUND);
        }

        return await this.userRepository.findOne({
            profile: profile
        }, { relations: ["profile"] });
    }

    buildProfileResponse(user: UserEntity): ProfileResponseInterface {
        return {
            profile:{
                username: user.username,
                ...user.profile
            }
        }
    }

    async addMatch(type: 'duel' | 'ladder', winner: UserEntity, loser: UserEntity) {
        const match = await this.matchService.createMatch(type, winner.profile, loser.profile);

        if (winner.profile.winMatches) {
            winner.profile.winMatches = [match, ...winner.profile.winMatches];
            if (type === 'ladder')
                winner.profile.victories += 1;
        } else {
            winner.profile.winMatches = [match];
            if (type === 'ladder')
                winner.profile.victories += 1;
        }
        await this.profileRepository.save(winner.profile);

        if (loser.profile.lossMatches) {
            loser.profile.lossMatches = [match, ...loser.profile.lossMatches];
            if (type === 'ladder')
                winner.profile.losses += 1;
        } else {
            loser.profile.lossMatches = [match];
            if (type === 'ladder')
                winner.profile.losses += 1;
        }
        await this.profileRepository.save(loser.profile);
    }

    async addAchievement(profile: ProfileEntity, achievementId: number) {
        const achievement = await this.achievementService.findAchievementById(achievementId);

        if (profile.achievements) {
            profile.achievements = [achievement, ...profile.achievements];
        } else {
            profile.achievements = [achievement]
        }
        return await this.profileRepository.save(profile);
    }
}