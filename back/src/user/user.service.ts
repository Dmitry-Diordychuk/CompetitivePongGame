import { Injectable } from '@nestjs/common';
import {UserEntity} from "@app/user/user.entity";
import {sign, verify} from "jsonwebtoken";
import {JWT_SECRET} from "@app/config";
import {Repository} from "typeorm";
import {InjectRepository} from "@nestjs/typeorm";
import {ChannelEntity} from "@app/chat/channel.entity";


@Injectable()
export class UserService {
    constructor(@InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>) {}

    generateJwt(user: UserEntity): string {
        const payload: TokenPayloadInterface = {
            id: user.id,
            ft_id: user.ft_id,
            username: user.username
        }
        return sign(
            payload,
            JWT_SECRET
        );
    }

    async getUserFromToken(token: string): Promise<UserEntity> {
        let payload;
        try {
            payload = verify(token, JWT_SECRET);
        }
        catch {
            return null
        }
        return await this.getUserById(payload.id);
    }

    async getUserById(id: number): Promise<UserEntity> {
        return await this.userRepository.findOne(id);
    }

    async addRoom(user: UserEntity, room: ChannelEntity): Promise<UserEntity> {
        user.connections.push(room);
        return this.userRepository.save(user);
    }
}
