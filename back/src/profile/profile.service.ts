import {InjectRepository} from "@nestjs/typeorm";
import {UserEntity} from "@app/user/user.entity";
import {Repository} from "typeorm";
import {ProfileResponseInterface} from "@app/profile/type/profileResponse.interface";
import {ProfileEntity} from "@app/profile/profile.entity";
import {HttpException, HttpStatus} from "@nestjs/common";

export class ProfileService {
    constructor(
        @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
        @InjectRepository(ProfileEntity) private readonly profileRepository: Repository<ProfileEntity>
    ) {}

    async getCurrentUserProfile(currentUserId: number): Promise<UserEntity> {
        return await this.userRepository.findOne(currentUserId, { relations: ["profile"] });
    }

    async getProfileById(profileId: number): Promise<UserEntity> {
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
}