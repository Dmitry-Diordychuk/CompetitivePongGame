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

    async joinChannel(socket: Socket, joinChannelDto: JoinChannelDto): Promise<any> {
        const user = await this.authorize(socket);

        let channel = user.connections.find(ch => ch.name === joinChannelDto.name);

        if (!channel) {
            channel = await this.createChannel(user, joinChannelDto);
        }

        if (await this.tryChannelPassword(channel, joinChannelDto.password)) {
            return {"channel": channel.name};
        }
        throw new WsException("Wrong password!");
    }

    async leaveChannel(socket: Socket, leaveChannelDto: LeaveChannelDto): Promise<any> {
        const user = await this.authorize(socket);

        const channels = await this.findAllChannels(user.id)

        const target_channel = channels.find(ch => ch.name == leaveChannelDto.name);

        if (!target_channel) {
            throw new WsException({"errors": "User is not in channel"})
        }

        // TODO: Уменьшить число запросов добавив запрос findAllChannels в этот запрос.
        await getConnection()
            .createQueryBuilder()
            .relation(UserEntity, "connections")
            .of(user)
            .remove(target_channel)

        console.log(target_channel);

        return target_channel;
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

    async findAllChannels(currentUserId: number): Promise<ChannelEntity[]> {
        const user = await this.userRepository.findOne({
            relations: ['connections'],
            where: { id: currentUserId }
        });
        return user.connections;
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

    async createChannel(user: UserEntity, joinChannelDto: JoinChannelDto): Promise<ChannelEntity> {
        const channel = await this.findChannelByName(joinChannelDto.name);

        if (channel)
            throw new WsException("Channel " + joinChannelDto.name + " exist!");

        const newChannel = new ChannelEntity();
        Object.assign(newChannel, joinChannelDto);
        newChannel.owner = user;
        return await this.channelRepository.save(newChannel);
    }

    async tryChannelPassword(channel: ChannelEntity, password: string): Promise<boolean> {
        if (channel.password === null && password === null) {
            return true;
        }
        if (channel.password === null || password === null) {
            return false;
        }
        if (await compare(password, channel.password, null)) {
            return true;
        }
        return false;
    }


}
