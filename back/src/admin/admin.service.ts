import Role from "@app/user/types/role.enum";
import {InjectRepository} from "@nestjs/typeorm";
import {UserEntity} from "@app/user/user.entity";
import {Repository, UpdateResult} from "typeorm";
import {UserService} from "@app/user/user.service";
import {HttpException} from "@nestjs/common";
import {ChannelEntity} from "@app/chat/channel.entity";
import {ChatService} from "@app/chat/chat.service";

export class AdminService {
    constructor(
        @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
        @InjectRepository(ChannelEntity) private readonly channelRepository: Repository<ChannelEntity>,
        private readonly userService: UserService,
        private readonly chatService: ChatService,
    ) {}

    async makeAdmin(userId: number) {
        const user = await this.userService.getUserById(userId);

        if (!user) {
            throw new HttpException('There is no such user!', 404);
        } else if (user.role === Role.Admin || user.role === Role.Owner) {
            throw new HttpException("User already admin!", 404);
        }

        return await this.userRepository.update(userId, {
            role: Role.Admin,
        })
    }

    async banUser(userId: number): Promise<UpdateResult> {
        const user = await this.userService.getUserById(userId);

        if (!user) {
            throw new HttpException('There is no such user!', 404);
        } else if (user.role === Role.Admin || user.role === Role.Owner) {
            throw new HttpException("You can't ban administrator!", 404);
        }

        return await this.userRepository.update(userId, {
            role: Role.Banned,
        })
    }

    async destroyChannel(channelId: number) {
        await this.channelRepository.findOne(channelId);
        await this.channelRepository.delete(channelId);
    }

    async makeChannelOwner(channelId: number, userId: number): Promise<ChannelEntity> {
        const channel = await this.chatService.findChannelById(channelId);

        const user = await this.userService.getUserById(userId);

        if (!user) {
            throw new HttpException('There is no such user!', 404);
        } else if (user.role === Role.Admin || user.role === Role.Owner) {
            throw new HttpException("User already admin!", 404);
        }

        channel.owner = user;

        await this.channelRepository.save(channel);
        return (channel);
    }

    async removeChannelOwner(channelId: number): Promise<ChannelEntity> {
        const channel = await this.chatService.findChannelById(channelId);

        channel.owner = null;
        await this.channelRepository.save(channel);
        return (channel);
    }

    async makeChannelAdmin(channelId: number, userId: number): Promise<ChannelEntity> {
        const channel = await this.chatService.findChannelById(channelId);

        const user = await this.userService.getUserById(userId);

        if (!user) {
            throw new HttpException('There is no such user!', 404);
        } else if (user.role === Role.Admin || user.role === Role.Owner) {
            throw new HttpException("User already admin!", 404);
        }

        channel.admins.push(user);

        await this.channelRepository.save(channel);
        return (channel);
    }

    async removeChannelAdmin(channelId: number, userId: number): Promise<ChannelEntity> {
        const channel = await this.chatService.findChannelById(channelId);

        const user = channel.admins.find(u => u.id === user.id);

        if (!user) {
            throw new HttpException('There is no such user!', 404);
        }

        channel.admins = channel.admins.filter(u => u.id === user.id);

        await this.channelRepository.save(channel);
        return (channel);
    }
}