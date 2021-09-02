import { Injectable } from '@nestjs/common';
import {UsersEntity} from "@app/users/users.entity";
import {sign, verify} from "jsonwebtoken";
import {JWT_SECRET} from "@app/config";
import {Repository} from "typeorm";
import {InjectRepository} from "@nestjs/typeorm";
import {UserResponseInterface} from "@app/users/types/users.interface";


@Injectable()
export class UsersService {
    constructor(@InjectRepository(UsersEntity) private readonly userRepository: Repository<UsersEntity>) {}

    generateJwt(user: UsersEntity): string {
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

    async getUserFromToken(token: string): Promise<UsersEntity> {
        const payload : TokenPayloadInterface = verify(token, JWT_SECRET);
        if (payload.id) {
            return await this.getUserById(payload.id);
        }
        return null;
    }

    async getUserById(id: number): Promise<UsersEntity> {
        return await this.userRepository.findOne(id);
    }
}
