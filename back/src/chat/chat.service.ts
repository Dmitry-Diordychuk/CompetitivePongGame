import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {Socket} from "socket.io";
import {WsException} from "@nestjs/websockets";
import {UserService} from "@app/user/user.service";
import {UserEntity} from "@app/user/user.entity";
import {ChannelEntity} from "@app/chat/channel.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {getConnection, Repository} from "typeorm";
import {JoinChannelDto} from "@app/chat/dto/joinChannel.dto";
import {compare} from "bcrypt";
import {LeaveChannelDto} from "@app/chat/dto/leaveChannel.dto";
import {CreateChannelDto} from "@app/chat/dto/createChannel.dto";
import {ChannelsResponseInterface} from "@app/chat/types/channelsResponse.interface";
import {ChannelResponseInterface} from "@app/chat/types/channelResponse.interface";
import {UpdateChannelDto} from "@app/chat/dto/updateChannel.dto";
import {hash} from "bcrypt"


@Injectable()
export class ChatService {
    constructor(
        private readonly userService: UserService,
        @InjectRepository(ChannelEntity) private readonly channelRepository: Repository<ChannelEntity>,
        @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>
    ) {}

    async authorize(socket: Socket): Promise<UserEntity> {
        const auth_field = socket.handshake.headers.authorization;

        if (!auth_field) {
            throw new WsException('There is no token in authorization field');
        }

        const token = auth_field.split(' ')[1];

        return await this.getUserFromToken(token);
    }

    async createGeneralChannel(): Promise<ChannelEntity> {
        const general = await this.findChannelByName('general');

        if (!general) {
            const newChannel = new ChannelEntity();
            newChannel.name = "general";
            newChannel.password = null;
            newChannel.owner = null;
            return await this.channelRepository.save(newChannel);
        }
        return general;
    }

    async createChannel(user: UserEntity, createChannelDto: CreateChannelDto): Promise<any> {
        const channel = await this.findChannelByName(createChannelDto.name);

        if (channel) {
            throw new WsException("Channel " + createChannelDto.name + " exist!");
        }

        const newChannel = new ChannelEntity();
        Object.assign(newChannel, createChannelDto);
        newChannel.owner = user;

        user.connections = await this.userService.getChannelsByUserId(user.id);
        user.connections.push(newChannel);

        await this.userRepository.save(user);
        await this.channelRepository.save(newChannel);
        return {"channel": newChannel.name};
    }

    async joinChannel(user: UserEntity, joinChannelDto: JoinChannelDto): Promise<any> {
        const channel = await this.findChannelByName(joinChannelDto.name);

        if (!channel) {
            throw new WsException("Channel doesn't exist");
        }

        if (await this.isChannelPassword(channel, joinChannelDto.password)) {
            return {"channel": channel.name};
        }
        throw new WsException("Wrong password");
    }


    async leaveChannel(user: UserEntity, leaveChannelDto: LeaveChannelDto): Promise<any> {
        const channels = await this.userService.getChannelsByUserId(user.id)
        const target_channel = channels.find(ch => ch.name == leaveChannelDto.name);

        if (!target_channel) {
            throw new WsException({"errors": "User is not in channel"})
        }

        user.connections = channels;
        user.connections = user.connections.filter(connection =>
            connection.id !== target_channel.id
        );
        await getConnection().manager.save(user);

        if (target_channel.owner.id === user.id) {
            await this.channelRepository.remove(target_channel);
        }

        return target_channel;
    }

    async updateChannel(user: UserEntity, updateChannelDto: UpdateChannelDto) {
        const channel = await this.channelRepository.findOne({
            name: updateChannelDto.name
        }, { relations: ["owner"], select: ["id", "password"] });

        if (!channel) {
            throw new WsException("There is no such channel");
        }

        if (channel.owner.id !== user.id) {
            throw new WsException("User isn't channel owner");
        }

        if (!await this.isChannelPassword(channel, updateChannelDto.oldPassword)) {
            throw new WsException("Wrong password");
        }

        channel.password = await hash(updateChannelDto.newPassword, 10);
        await this.channelRepository.save(channel);

        return {
            "channel": channel.name,
            "status": "password updated"
        }
    }

    async addUserToChannelByName(user: UserEntity, channel_name: string): Promise<UserEntity> {
        const channel = await this.channelRepository.findOne({
            name: channel_name
        });

        if (!channel)
            throw new WsException("Channel " + channel_name + " doesn't exist");

        user.connections = await this.userService.getChannelsByUserId(user.id);
        user.connections.push(channel);
        return await getConnection().manager.save(user);
    }

    async getUserFromToken(token: string): Promise<UserEntity> {
        try {
            return await this.userService.getUserFromToken(token);
        }
        catch {
            throw new WsException('jwt malformed');
        }
    }

    async findChannelByName(name: string) {
        return await this.channelRepository.findOne({
            name: name
        }, {
            select: ['id', 'name', 'password']
        });
    }

    async isChannelPassword(channel: ChannelEntity, password: string): Promise<boolean> {
        if (channel.password === null && password === null) {
            return true;
        } else if (channel.password === null || password === null) {
            return false;
        }

        return !!(await compare(password, channel.password, null));
    }

    async getChannel(channel_id: number): Promise<ChannelResponseInterface> {
        const channel = await this.channelRepository.findOne(channel_id);

        if (!channel) {
            throw new HttpException("Channel doesn't exit", HttpStatus.NOT_FOUND);
        }

        return {channel};
    }

    async getUserOpenChannels(user_id: number): Promise<ChannelsResponseInterface> {
        const channels = await this.userService.getChannelsByUserId(user_id);
        const counter = channels.length;

        return {
            channels,
            counter
        };
    }

    async makeAdmin(currentUserId, userId: number, channelId: number) {
        if (currentUserId === userId) {
            throw new HttpException("User is owner", HttpStatus.BAD_REQUEST);
        }

        const channel = await this.channelRepository.findOne(channelId, { relations: ["owner", "admins"] });

        if (channel.owner.id !== currentUserId) {
            throw new HttpException("Current user isn't channel owner", HttpStatus.BAD_REQUEST);
        }

        const user = await this.userRepository.findOne(userId);

        if (!user) {
            throw new HttpException("Such user doesn't exist", HttpStatus.BAD_REQUEST);
        }

        const userChannels = await this.userService.getChannelsByUserId(user.id);

        if (!userChannels.find(ch => ch.id === channel.id)) {
            throw new HttpException("User isn't in the channel", HttpStatus.BAD_REQUEST);
        }

        if (channel.admins.find(u => u.id === user.id)) {
            throw new HttpException("User already admin", HttpStatus.BAD_REQUEST);
        }
        channel.admins.push(user);

        return await this.channelRepository.save(channel);
    }
}
