import Role from "@app/user/types/role.enum";
import {InjectRepository} from "@nestjs/typeorm";
import {UserEntity} from "@app/user/user.entity";
import {Repository} from "typeorm";

export class AdminService {
    constructor(
        @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
    ) {}

    async banUser(userId: number, date: Date) {
        return await this.userRepository.update(userId, {
            role: Role.Banned,
        })
    }

}