import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {Socket} from "socket.io";
import {WsException} from "@nestjs/websockets";
import {UserService} from "@app/user/user.service";
import {UserEntity} from "@app/user/user.entity";
import {ChannelEntity} from "@app/chat/channel.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {getConnection, Repository, UpdateResult} from "typeorm";
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
import {Interval} from "@nestjs/schedule";


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
            newChannel.isHasPassword = false;
            return await this.channelRepository.save(newChannel);
        }
        return general;
    }

    // @Interval(1000)
    // async log() {
    //     console.log((await this.userService.getChannelsByUserId(101)).map(i => i.name));
    // }

    async createChannel(userId: number, createChannelDto: CreateChannelDto): Promise<any> {
        const user = await this.userService.getUserById(userId);
        const channel = await this.findChannelByName(createChannelDto.name);

        if (channel) {
            throw new WsException("Channel " + createChannelDto.name + " exist!");
        }

        let newChannel = new ChannelEntity();
        Object.assign(newChannel, createChannelDto);
        if (createChannelDto.password) {
            newChannel.isHasPassword = true;
        } else {
            newChannel.isHasPassword = false;
        }
        newChannel.owner = user;

        user.connections = await this.userService.getChannelsByUserId(user.id);
        user.connections.push(newChannel);
        newChannel.visitors = [user];

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

    async joinChannel(userId: number, joinChannelDto: JoinChannelDto, isAdmin: boolean): Promise<any> {
        const user = await this.userService.getUserById(userId);
        let channel = await this.findChannelByName(joinChannelDto.name);

        if (!channel) {
            throw new WsException("Channel doesn't exist");
        }

        if (!isAdmin) {
            if (!await this.isChannelPassword(channel, joinChannelDto.password)) {
                throw new WsException("Wrong password");
            }

            const sanction = channel.sanctions.find(s => s.target.id === user.id);
            if (sanction && sanction.type === 'ban') {
                if ((sanction.expiry_at.getTime() - Date.now()) < 0) {
                    channel.sanctions = channel.sanctions.filter(s => s.id !== sanction.id);
                } else {
                    throw new WsException("You have been banned till " + sanction.expiry_at);
                }
            }

            channel.visitors.push(user);
            channel = await this.channelRepository.save(channel);
        }

        return {
            "id": channel.id,
            "channel": channel.name
        };
    }


    async leaveChannel(userId: number, leaveChannelDto: LeaveChannelDto): Promise<any> {
        const user = await this.userRepository.findOne({
            relations: ['connections'],
            where: { id: userId }
        });

        let target_channel = user.connections.find(ch => ch.name == leaveChannelDto.name);

        if (!target_channel) {
            throw new WsException({"errors": "User is not in channel"})
        }

        target_channel = await this.channelRepository.findOne(target_channel.id, {
            relations: ["visitors"]
        });

        user.connections = user.connections.filter(connection =>
            connection.id !== target_channel.id
        );
        await getConnection().manager.save(user);
        
        if (target_channel.owner.id === user.id) {
            target_channel.visitors = target_channel.visitors.filter(u => u.id === userId);
            if (target_channel.admins.length !== 0) {
                target_channel.owner = target_channel.admins[0];
                target_channel.admins.shift();
                await this.channelRepository.save(target_channel);

            } else if (target_channel.visitors.length !== 1) {
                target_channel.owner = target_channel.visitors[0];
                await this.channelRepository.save(target_channel);

            } else {
                await this.channelRepository.remove(target_channel);
            }
        }

        return target_channel;
    }

    async updateChannel(userId: number, updateChannelDto: UpdateChannelDto) {
        const user = await this.userService.getUserById(userId);
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

        if (!updateChannelDto.newPassword) {
            channel.password = null;
            channel.isHasPassword = false;
        } else {
            channel.password = await hash(updateChannelDto.newPassword, 10);
            channel.isHasPassword = true;
        }
        await this.channelRepository.save(channel);

        return {
            "channel": channel.name,
            "status": "password updated"
        }
    }

    async addUserToChannelByName(userId: number, channel_name: string): Promise<UserEntity> {
        const user = await this.userService.getUserById(userId);
        const channel = await this.channelRepository.findOne({
            name: channel_name
        });

        if (!channel)
            throw new WsException("Channel " + channel_name + " doesn't exist");

        user.connections = await this.userService.getChannelsByUserId(user.id);
        user.connections.push(channel);
        return await this.userRepository.save(user);
        //return await getConnection().manager.save(user);
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
        if (!channel.password) {
            return true;
        }

        if (!password) {
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

    async deleteChannel(channel_id: number) {
        const channel = await this.channelRepository.findOne(channel_id);

        if (!channel) {
            throw new HttpException("Channel doesn't exit", HttpStatus.NOT_FOUND);
        }

        await this.channelRepository.remove(channel);
    }

    async getUserOpenChannels(userId: number): Promise<ChannelsResponseInterface> {
        let channels = await this.userService.getChannelsByUserId(userId);

        if (!channels.find(i => i.name === 'general')) {
            await this.addUserToChannelByName(userId, 'general');
            channels = await this.userService.getChannelsByUserId(userId);
        }

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

    async removeAdmin(currentUserId, userId: number, channelId: number) {
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

        if (!channel.admins.find(u => u.id === user.id)) {
            throw new HttpException("User isn't admin", HttpStatus.BAD_REQUEST);
        }
        channel.admins = channel.admins.filter(u => u.id !== user.id);
        return await this.channelRepository.save(channel);
    }

    async getChannelByName(channelName: string): Promise<ChannelEntity> {
        return await this.channelRepository.findOne({
                name: channelName,
        }, {
            relations: ["visitors", "sanctions"]
        });
    }

    checkIfOperationAllowed(currentUserId: number, targetUserId: number, channel: ChannelEntity) {
        const isCurrentUserOwner = channel.owner.id === currentUserId;
        const isCurrentUserAdmin = !!channel.admins.find(u => u.id === currentUserId);
        const isTargetOwner = channel.owner.id === targetUserId;
        const isTargetAdmin = !!channel.admins.find(u => u.id === targetUserId);

        if (!isCurrentUserOwner && !isCurrentUserAdmin) {
            throw new WsException("You're not allowed");
        }

        if (isTargetOwner) {
            throw new WsException("You're not allowed");
        }

        if (isCurrentUserAdmin && isTargetAdmin) {
            throw new WsException("You're not allowed");
        }
    }

    async applySanctionOnUser(currentUserId: number, sanctionDto: SanctionDto, channel: ChannelEntity): Promise<SanctionEntity> {
        if (!channel) {
            throw new WsException("Channel doesn't exist");
        }

        const targetUser = channel.visitors.find(u => u.id === sanctionDto.userId);

        if (!targetUser) {
            throw new WsException("There is no such user in the chat visitors list");
        }

        this.checkIfOperationAllowed(currentUserId, targetUser.id, channel);

        const expiryDate = new Date(sanctionDto.expiryAt);
        if ((expiryDate.getTime() - Date.now()) < 0) {
            throw new WsException("Expiry time already passed");
        }

        const sanction = new SanctionEntity();
        sanction.target = targetUser;
        sanction.expiry_at = expiryDate;
        sanction.type = sanctionDto.type;

        channel.sanctions = channel.sanctions.filter(sanction => sanction.target.id !== sanctionDto.userId);
        channel.sanctions.push(sanction);
        await this.channelRepository.save(channel);
        return sanction;
    }

    async isMuted(userId: number, channelName: string) {
        const user = await this.userService.getUserById(userId);
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

    async isBanned(userId: number, channel: ChannelEntity) {
        const sanction = channel.sanctions.find(s => s.target.id === userId);
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

    async getUserChannels(userId: number): Promise<ChannelEntity[]> {
        const user = await this.userService.getUserById(userId);
        return await this.channelRepository
            .createQueryBuilder("channels")
            .leftJoinAndSelect('channels.sanctions', 'sanctions')
            .leftJoinAndSelect('sanctions.target', 'targets')
            .innerJoin("channels.visitors", "visitors", 'visitors.id = :userid', {userid: user.id})
            .getMany()
    }

    async isInChannel(userId: number, channelName: string) {
        const channels = await this.getUserChannels(userId);
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

    async getAllChannels(take: number, skip: number): Promise<any> {
        const channels = await this.channelRepository.findAndCount({
            select: ["id", "name", "owner", "password"],
            relations: ["owner", "admins", "visitors", "sanctions"],
            order: {
                name: "ASC"
            },
            skip: skip,
            take: take,
        });
        channels[0].map((channel: any) => {
            if (channel.password)
                channel.password = true;
            else
                channel.password = false;
        })
        return channels;
    }
}
