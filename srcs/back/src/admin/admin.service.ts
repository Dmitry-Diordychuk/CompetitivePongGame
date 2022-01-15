import Role from "@app/user/types/role.enum";
import {InjectRepository} from "@nestjs/typeorm";
import {UserEntity} from "@app/user/user.entity";
import {Repository, UpdateResult} from "typeorm";
import {UserService} from "@app/user/user.service";
import {HttpException, HttpStatus} from "@nestjs/common";
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
            throw new HttpException('There is no such user!', HttpStatus.NOT_FOUND);
        } else if (user.role === Role.Admin || user.role === Role.PO) {
            throw new HttpException("User already admin!", HttpStatus.BAD_REQUEST);
        }

        return await this.userRepository.update(userId, {
            role: Role.Admin,
        })
    }

    async makeUser(userId: number) {
        const user = await this.userService.getUserById(userId);

        if (!user) {
            throw new HttpException('There is no such user!', HttpStatus.NOT_FOUND);
        } else if (user.role === Role.PO) {
            throw new HttpException("You can't remove owner!", HttpStatus.BAD_REQUEST);
        } else if (user.role === Role.User) {
            throw new HttpException("Already user!", HttpStatus.BAD_REQUEST);
        }

        return await this.userRepository.update(userId, {
            role: Role.User,
        })
    }

    async banUser(targetId: number): Promise<UpdateResult> {
        const user = await this.userService.getUserById(targetId);

        if (!user) {
            throw new HttpException('There is no such user!', HttpStatus.NOT_FOUND);
        } else if (user.role === Role.PO || user.role === Role.Admin) {
            throw new HttpException("You can't ban administrator!", HttpStatus.BAD_REQUEST);
        }

        return await this.userRepository.update(targetId, {
            role: Role.Banned,
        })
    }

    async destroyChannel(channelId: number) {
        await this.channelRepository.findOne(channelId);
        await this.channelRepository.delete(channelId);
    }

    async makeChannelOwner(channelId: number, userName: string): Promise<ChannelEntity> {
        const channel = await this.chatService.findChannelById(channelId);

        if (userName === '') {
            await this.removeChannelOwner(channel);
            return channel;
        }

        const user = await this.userService.getUserByName(userName);

        if (!user) {
            throw new HttpException('There is no such user!', HttpStatus.NOT_FOUND);
        }

        channel.owner = user;

        await this.channelRepository.save(channel);
        return (channel);
    }

    async removeChannelOwner(channel: ChannelEntity): Promise<ChannelEntity> {
        channel.owner = null;
        await this.channelRepository.save(channel);
        return (channel);
    }

    async makeChannelAdmin(channelId: number, userName: string): Promise<ChannelEntity> {
        const channel = await this.chatService.findChannelById(channelId);

        const user = await this.userService.getUserByName(userName);

        if (!user) {
            throw new HttpException('There is no such user!', HttpStatus.NOT_FOUND);
        }

        if (channel.admins.includes(user) || channel.owner.id === user.id) {
            throw new HttpException('This user already admin!', HttpStatus.BAD_REQUEST);
        }

        channel.admins.push(user);

        await this.channelRepository.save(channel);
        return (channel);
    }

    async removeChannelAdmin(channelId: number, userName: string): Promise<ChannelEntity> {
        const channel = await this.chatService.findChannelById(channelId);

        const user = await this.userService.getUserByName(userName);

        if (!user) {
            throw new HttpException('There is no such user!', HttpStatus.NOT_FOUND);
        }

        channel.admins = channel.admins.filter(u => u.id !== user.id);

        await this.channelRepository.save(channel);
        return (channel);
    }
}