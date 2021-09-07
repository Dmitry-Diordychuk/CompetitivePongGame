import { Injectable } from '@nestjs/common';
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

        if (channel)
            throw new WsException("Channel " + createChannelDto.name + " exist!");

        const newChannel = new ChannelEntity();
        Object.assign(newChannel, createChannelDto);
        newChannel.owner = user;

        user.connections = await this.userService.getChannelsById(user.id);
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

        if (await this.tryChannelPassword(channel, joinChannelDto.password)) {
            return {"channel": channel.name};
        }
        throw new WsException("Wrong password");
    }


    async leaveChannel(socket: Socket, leaveChannelDto: LeaveChannelDto): Promise<any> {
        const user = await this.authorize(socket);

        const channels = await this.userService.getChannelsById(user.id)
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

    async addUserToChannelByName(user: UserEntity, channel_name: string): Promise<UserEntity> {
        const channel = await this.channelRepository.findOne({
            name: channel_name
        });

        if (!channel)
            throw new WsException("Channel " + channel_name + " doesn't exist");

        user.connections = await this.userService.getChannelsById(user.id);
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

    async tryChannelPassword(channel: ChannelEntity, password: string): Promise<boolean> {
        if (channel.password === null && password === null) {
            return true;
        }
        if (channel.password === null || password === null) {
            return false;
        }
        return !!(await compare(password, channel.password, null));
    }
}
