import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {Socket} from "socket.io";
import {WsException} from "@nestjs/websockets";
import {UserService} from "@app/user/user.service";
import {UserEntity} from "@app/user/user.entity";
import {ChannelEntity} from "@app/chat/channel.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {getConnection, Repository} from "typeorm";
import {JoinChannelDto} from "@app/chat/dto/joinChannel.dto";
import {compare, hash} from "bcrypt";
import {LeaveChannelDto} from "@app/chat/dto/leaveChannel.dto";
import {CreateChannelDto} from "@app/chat/dto/createChannel.dto";
import {ChannelsResponseInterface} from "@app/chat/types/channelsResponse.interface";
import {ChannelResponseInterface} from "@app/chat/types/channelResponse.interface";
import {UpdateChannelDto} from "@app/chat/dto/updateChannel.dto";
import {SanctionDto} from "@app/chat/dto/sanction.dto";
import {SanctionEntity} from "@app/sanction/sanction.entity";
import Role from "@app/user/types/role.enum";


@Injectable()
export class ChatService {
    constructor(
        private readonly userService: UserService,
        @InjectRepository(ChannelEntity) private readonly channelRepository: Repository<ChannelEntity>,
        @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
        @InjectRepository(SanctionEntity) private readonly sanctionRepository: Repository<SanctionEntity>
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

        let newChannel = new ChannelEntity();
        Object.assign(newChannel, createChannelDto);
        newChannel.owner = user;

        user.connections = await this.userService.getChannelsByUserId(user.id);
        user.connections.push(newChannel);

        await this.userRepository.save(user);
        newChannel = await this.channelRepository.save(newChannel);
        return {
            "owner" : {
                "id" : newChannel.owner.id,
                "username" : newChannel.owner.username
            },
            "id": newChannel.id,
            "channel": newChannel.name
        };
    }

    async joinChannel(user: UserEntity, joinChannelDto: JoinChannelDto): Promise<any> {
        let channel = await this.findChannelByName(joinChannelDto.name);

        if (!channel) {
            throw new WsException("Channel doesn't exist");
        }

        if (user.role !== Role.Admin && user.role !== Role.Owner) {
            if (!await this.isChannelPassword(channel, joinChannelDto.password)) {
                throw new WsException("Wrong password");
            }
        }

        const sanction = channel.sanctions.find(s => s.target.id === user.id);
        if (sanction && sanction.type === 'ban') {
            if ((sanction.expiry_at.getTime() - Date.now()) < 0) {
                channel.sanctions = channel.sanctions.filter(s => s.id !== sanction.id);
            } else {
                throw new WsException("You have been banned till " + sanction.expiry_at);
            }
        }

        if (user.role !== Role.Admin && user.role !== Role.Owner) {
            channel.visitors.push(user);
            channel = await this.channelRepository.save(channel);
        }

        return {
            "id": channel.id,
            "channel": channel.name
        };
    }


    async leaveChannel(user: UserEntity, leaveChannelDto: LeaveChannelDto): Promise<any> {
        const channels = await this.userService.getChannelsByUserId(user.id)

        let target_channel = channels.find(ch => ch.name == leaveChannelDto.name);

        if (!target_channel) {
            throw new WsException({"errors": "User is not in channel"})
        }

        target_channel = await this.channelRepository.findOne(target_channel.id, {
            relations: ["visitors"]
        });

        user.connections = channels;
        user.connections = user.connections.filter(connection =>
            connection.id !== target_channel.id
        );
        await getConnection().manager.save(user);

        if (target_channel.owner.id === user.id) {
            if (target_channel.admins.length !== 0) {
                target_channel.owner = target_channel.admins[0];
                target_channel.admins.shift();
                await this.channelRepository.save(target_channel);

            } else if (target_channel.visitors.length !== 1) {
                target_channel.owner = target_channel.visitors.find(visitor => visitor !== target_channel.owner);
                await this.channelRepository.save(target_channel);

            } else {
                await this.channelRepository.remove(target_channel);
            }
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
            select: ['id', 'name', 'password'],
            relations: ["sanctions"]
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
        return {
            channels,
            counter: channels.length
        };
    }

    async getAllPublicChannels(): Promise<ChannelsResponseInterface> {
        const channels: ChannelEntity[] = await this.channelRepository.find({
            password: null
        });
        return {
            channels,
            counter: channels.length
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

    async isAdminOrOwner(channel: ChannelEntity, userId) {
        let admin;

        if (channel.owner.id === userId) {
            admin = channel.owner;
        } else {
            admin = channel.admins.find(u => u.id === userId);
        }

        return admin;
    }

    async getChannelByName(channelName: string): Promise<ChannelEntity> {
        return await this.channelRepository.findOne({
                name: channelName,
        }, {
            relations: ["visitors", "sanctions"]
        });
    }

    async applySanctionOnUser(currentUserId: number, sanctionDto: SanctionDto, channel: ChannelEntity): Promise<SanctionEntity> {
        if (!channel) {
            throw new WsException("Channel doesn't exist");
        }

        if (!await this.isAdminOrOwner(channel, currentUserId)) {
            throw new WsException("You're not allowed");
        }

        if (currentUserId === sanctionDto.userId) {
            throw new WsException("You can't ban yourself");
        }

        if (channel.admins.find(u => u.id === sanctionDto.userId)) {
            throw new WsException("You can't ban other admin");
        }

        const targetUser = channel.visitors.find(u => u.id === sanctionDto.userId);

        if (!targetUser) {
            throw new WsException("There is no such user in the chat visitors list");
        }

        const expiryDate = new Date(sanctionDto.expiryAt);
        if ((expiryDate.getTime() - Date.now()) < 0) {
            throw new WsException("Expiry time already passed");
        }

        const sanction = new SanctionEntity();
        sanction.target = targetUser;
        sanction.expiry_at = expiryDate;
        sanction.type = sanctionDto.type;

        channel.sanctions.push(sanction);
        await this.channelRepository.save(channel);
        return sanction;
    }

    async isMuted(user: UserEntity, channelName: string) {
        const channel = await this.channelRepository.findOne({
            name: channelName
        });

        if (!channel) {
            throw new WsException("Channel doesn't exist");
        }

        const sanction = channel.sanctions.find(s => s.target.id === user.id);
        if (!sanction) {
            return false;
        }

        if ((sanction.expiry_at.getTime() - Date.now()) < 0) {
            channel.sanctions = channel.sanctions.filter(s => s.id !== sanction.id);
            await this.channelRepository.save(channel);
            return false;
        }

        if (sanction.type === "mute") {
            throw new WsException("You have been muted until " + sanction.expiry_at);
        }
        return false;
    }

    async isBanned(user: UserEntity, channel: ChannelEntity) {
        const sanction = channel.sanctions.find(s => s.target.id === user.id);
        if (!sanction) {
            return false;
        }

        if ((sanction.expiry_at.getTime() - Date.now()) < 0) {
            channel.sanctions = channel.sanctions.filter(s => s.id !== sanction.id);
            await this.channelRepository.save(channel);
            return false;
        }

        return sanction.type === "ban";
    }

    async getUserChannels(user: UserEntity): Promise<ChannelEntity[]> {
        return await this.channelRepository
            .createQueryBuilder("channels")
            .leftJoinAndSelect('channels.sanctions', 'sanctions')
            .leftJoinAndSelect('sanctions.target', 'targets')
            .innerJoin("channels.visitors", "visitors", 'visitors.id = :userid', {userid: user.id})
            .getMany()
    }

    async isInChannel(user: UserEntity, channelName: string) {
        const channels = await this.getUserChannels(user);
        for (let ch of channels) {
            if (ch.name === channelName) {
                return true;
            }
        }
        throw new WsException("User is not in the channel");
    }

    async removeUserFromChannel(targetUserId: number, channelName: string): Promise<ChannelEntity> {
        const channel = await this.channelRepository.findOne({
            name: channelName
        });
        channel.visitors = channel.visitors.filter(u => u.id !== targetUserId);
        return await this.channelRepository.save(channel);
    }

    async getUserIdByUsername(username: string): Promise<number> {
        return await this.userService.getUserIdByUsername(username);
    }

    async findChannelById(channelId: number): Promise<ChannelEntity> {
        const channel = await this.channelRepository.findOne(channelId);

        if (!channel) {
            throw new HttpException("There is no such channel!", 404);
        }

        return (channel);
    }
}
