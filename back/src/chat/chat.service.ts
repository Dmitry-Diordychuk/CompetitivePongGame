import { Injectable } from '@nestjs/common';
import {Socket} from "socket.io";
import {WsException} from "@nestjs/websockets";
import {UsersService} from "@app/users/users.service";
import {UsersEntity} from "@app/users/users.entity";
import {ChannelEntity} from "@app/chat/channel.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {JoinChannelDto} from "@app/chat/dto/joinChannel.dto";
import {compare} from "bcrypt";

@Injectable()
export class ChatService {
    constructor(
        private readonly userService: UsersService,
        @InjectRepository(ChannelEntity) private readonly channelRepository: Repository<ChannelEntity>
    ) {}

    getToken(socket: Socket): string {
        const auth_field = socket.handshake.headers.authorization;

        if (!auth_field) {
            throw new WsException('There is no token in authorization field');
        }

        const token = auth_field.split(' ')[1];
        return token
    }

    async getUserFromToken(token: string): Promise<UsersEntity> {
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

    async createGeneralChannel(): Promise<ChannelEntity> {
        const general = await this.findChannelByName('general');

        if (!general) {
            const newChannel = new ChannelEntity();
            newChannel.name = "general";
            newChannel.password = null;
            return await this.channelRepository.save(newChannel);
        }
        return general;
    }

    async createChannel(joinChannelDto: JoinChannelDto): Promise<ChannelEntity> {
        const channel = await this.findChannelByName(joinChannelDto.name);

        if (channel)
            throw new WsException("Channel " + joinChannelDto.name + " exist!");

        const newChannel = new ChannelEntity();
        Object.assign(newChannel, joinChannelDto);
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
