import {InjectRepository} from "@nestjs/typeorm";
import {UserEntity} from "@app/user/user.entity";
import {Repository} from "typeorm";
import {ProfileResponseInterface} from "@app/profile/type/profileResponse.interface";

export class ProfileService {
    constructor(@InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>) {
    }

    async getCurrentUserProfile(currentUserId: number): Promise<UserEntity> {
        return await this.userRepository.findOne(currentUserId, { relations: ["profile"] });
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