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
        return await this.getUserWithProfileById(currentUserId);
    }

    // async getProfileById(id: number): Promise<ProfileEntity> {
    //     return await this.userRepository
    // }

    async getUserWithProfileById(profileId: number): Promise<UserEntity> {
        const user = await this.userRepository.createQueryBuilder("user")
            .select([
                "user.id",
                "user.username",
                "user.role",
                "user.ftId",
                "user.isTwoFactorAuthenticationEnable",
                "user.twoFactorAuthenticationsSecret"
                ],
            )
            .leftJoinAndSelect("user.profile", "profile")
            .leftJoinAndSelect("profile.winMatches", "winMatches")
            .leftJoinAndSelect("profile.lossMatches", "lossMatches")
            .leftJoinAndSelect("profile.achievements", "achievements")
            .leftJoinAndSelect("winMatches.winner", "win_winner")
            .leftJoinAndSelect("winMatches.loser", "win_loser")
            .leftJoinAndSelect("lossMatches.winner", "loss_winner")
            .leftJoinAndSelect("lossMatches.loser", "loss_loser")
            .where(`user.id = ${profileId}`, {id: profileId})
            .andWhere("user.id = profile.id")
            .getOne();

        if (!user) {
            throw new HttpException("Profile doesn't exist", HttpStatus.NOT_FOUND);
        }

        return user;
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

        while (counter < matches.length && (matches[counter].winner.id === profileId) === isWinStreak)
            counter++;

        if (isWinStreak === true)
            return (counter);
        return (-counter);
    }

    async addMatch(type: 'duel' | 'ladder', winner: UserEntity, loser: UserEntity) {
        const winnerWithProfile = await this.getUserWithProfileById(winner.id);
        const loserWithProfile = await this.getUserWithProfileById(loser.id);


        const match = await this.matchService.createMatch(type, winnerWithProfile.profile, loserWithProfile.profile);

        if (winnerWithProfile.profile.winMatches) {
            winnerWithProfile.profile.winMatches = [match, ...winnerWithProfile.profile.winMatches];
            if (type === 'ladder') {
                winnerWithProfile.profile.victories += 1;
            }
        } else {
            winnerWithProfile.profile.winMatches = [match];
            if (type === 'ladder') {
                winnerWithProfile.profile.victories += 1;
            }
        }

        if (loserWithProfile.profile.lossMatches) {
            loserWithProfile.profile.lossMatches = [match, ...loserWithProfile.profile.lossMatches];
            if (type === 'ladder')
                loserWithProfile.profile.losses += 1;
        } else {
            loserWithProfile.profile.lossMatches = [match];
            if (type === 'ladder') {
                loserWithProfile.profile.losses += 1;
            }
        }

        await this.profileRepository.save(winnerWithProfile.profile);
        await this.profileRepository.save(loserWithProfile.profile);
    }

    async unlockAchievements(userId: number) {
        const user = await this.getUserWithProfileById(userId);

        let wonMatches = user.profile.winMatches.filter(match => match.type === 'ladder');
        let lostMatches = user.profile.lossMatches.filter(match => match.type === 'ladder');
        let matches = [...wonMatches, ...lostMatches];
        const streak = this.calculateStreak(matches, user.profile.id);

        if (matches.length === 1) {
            await this.addAchievement(user.profile, 1);
        } else if (matches.length === 3) {
            await this.addAchievement(user.profile, 2);
        } else if (matches.length === 7) {
            await this.addAchievement(user.profile, 3);
        }

        if (user.profile.victories === 1) {
            await this.addAchievement(user.profile, 4);
        } else if (user.profile.victories === 3) {
            await this.addAchievement(user.profile, 5);
        } else if (user.profile.victories === 5) {
            await this.addAchievement(user.profile, 6);
        }

        if (streak === 3) {
            await this.addAchievement(user.profile, 7);
        } else if (streak === 4) {
            await this.addAchievement(user.profile, 8);
        } else if (streak === 5) {
            await this.addAchievement(user.profile, 9);
        }

        if (user.profile.losses === 1) {
            await this.addAchievement(user.profile, 12);
        } else if (user.profile.losses === 3) {
            await this.addAchievement(user.profile, 13);
        } else if (user.profile.losses === 5) {
            await this.addAchievement(user.profile, 14);
        }

        if (streak === -2) {
            await this.addAchievement(user.profile, 15);
        } else if (streak === -3) {
            await this.addAchievement(user.profile, 16);
        } else if (streak === -4) {
            await this.addAchievement(user.profile, 17);
        }

        //await this.profileRepository.save(user.profile);
    }

    async calculateLevel(user: UserEntity, rival: UserEntity) {
        const userWithProfile = await this.getUserWithProfileById(user.id);
        const rivalWithProfile = await this.getUserWithProfileById(rival.id);

        let playerLevel = userWithProfile.profile.level;
        const rivalLevel = rivalWithProfile.profile.level;

        const levelDiff = rivalLevel - playerLevel;
        const exp = 1 + levelDiff / 10;

        userWithProfile.profile.exp += exp;

        userWithProfile.profile.level = Math.floor(Math.log2(userWithProfile.profile.exp + 1));

        await this.profileRepository.save(userWithProfile.profile);
    }

    async addAchievement(profile: ProfileEntity, achievementId: number) {
        const achievement = await this.achievementService.findAchievementById(achievementId);

        if (profile.achievements.some(a => a.id === achievementId)) {
            return;
        }

        profile.achievements.push(achievement);
        return await this.profileRepository.save(profile);
    }
}