import {InjectRepository} from "@nestjs/typeorm";
import {UserEntity} from "@app/user/user.entity";
import {Repository} from "typeorm";
import {ProfileResponseInterface} from "@app/profile/type/profileResponse.interface";
import {ProfileEntity} from "@app/profile/profile.entity";
import {HttpException, HttpStatus} from "@nestjs/common";
import {MatchService} from "@app/match/match.service";
import {AchievementService} from "@app/achievement/achievement.service";
import {AchievementEntity} from "@app/achievement/achievement.entity";
import {MatchEntity} from "@app/match/match.entity";
import {matches} from "class-validator";

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

    calculateStreak(matches: MatchEntity[], profileId): number {
        if (matches.length < 3)
            return 0;
        matches = matches.sort((a, b) => (a.create_at < b.create_at) ? 1 : -1);
        let counter = 0;
        let isWinStreak = matches[0].winner.id === profileId;

        while ((matches[counter].winner.id === profileId) === isWinStreak)
            counter++;

        if (isWinStreak === true)
            return (counter);
        return (-counter);
    }

    async addMatch(type: 'duel' | 'ladder', winner: UserEntity, loser: UserEntity) {
        const match = await this.matchService.createMatch(type, winner.profile, loser.profile);

        if (winner.profile.winMatches) {
            winner.profile.winMatches = [match, ...winner.profile.winMatches];
            if (type === 'ladder') {
                winner.profile.victories += 1;
            }
        } else {
            winner.profile.winMatches = [match];
            if (type === 'ladder') {
                winner.profile.victories += 1;
            }
        }

        if (loser.profile.lossMatches) {
            loser.profile.lossMatches = [match, ...loser.profile.lossMatches];
            if (type === 'ladder')
                loser.profile.losses += 1;
        } else {
            loser.profile.lossMatches = [match];
            if (type === 'ladder') {
                loser.profile.losses += 1;
            }
        }

        await this.profileRepository.save(winner.profile);
        await this.profileRepository.save(loser.profile);
    }

    async unlockAchievements(profile: ProfileEntity) {
        let wonMatches = profile.winMatches.filter(match => match.type === 'ladder');
        let lostMatches = profile.lossMatches.filter(match => match.type === 'ladder');
        let matches = [...wonMatches, ...lostMatches];
        const streak = this.calculateStreak(matches, profile.id);

        if (matches.length === 1) {
            await this.addAchievement(profile, 1);
        } else if (matches.length === 3) {
            await this.addAchievement(profile, 2);
        } else if (matches.length === 7) {
            await this.addAchievement(profile, 3);
        }

        if (profile.victories === 1) {
            await this.addAchievement(profile, 4);
        } else if (profile.victories === 3) {
            await this.addAchievement(profile, 5);
        } else if (profile.victories === 5) {
            await this.addAchievement(profile, 6);
        }

        if (streak === 3) {
            await this.addAchievement(profile, 7);
        } else if (streak === 4) {
            await this.addAchievement(profile, 8);
        } else if (streak === 5) {
            await this.addAchievement(profile, 9);
        }

        if (profile.losses === 1) {
            await this.addAchievement(profile, 12);
        } else if (profile.losses === 3) {
            await this.addAchievement(profile, 13);
        } else if (profile.losses === 5) {
            await this.addAchievement(profile, 14);
        }

        if (streak === -2) {
            await this.addAchievement(profile, 15);
        } else if (streak === -3) {
            await this.addAchievement(profile, 16);
        } else if (streak === -4) {
            await this.addAchievement(profile, 17);
        }
    }

    async addAchievement(profile: ProfileEntity, achievementId: number) {
        const achievement = await this.achievementService.findAchievementById(achievementId);

        if (profile.achievements.some(a => a.id === achievementId)) {
            return;
        }

        if (profile.achievements) {
            profile.achievements = [achievement, ...profile.achievements];
        } else {
            profile.achievements = [achievement]
        }
        return await this.profileRepository.save(profile);
    }
}