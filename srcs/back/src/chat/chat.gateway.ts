import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from "@nestjs/websockets";
import {Server, Socket} from 'socket.io'
import {ChatService} from "@app/chat/chat.service";
import {Get, Logger, Param, ParseIntPipe, UseFilters, UseGuards, UsePipes, ValidationPipe} from "@nestjs/common";
import {JoinChannelDto} from "@app/chat/dto/joinChannel.dto";
import {ReceiveMessageDto} from "@app/chat/dto/receiveMessage.dto";
import {LeaveChannelDto} from "@app/chat/dto/leaveChannel.dto";
import {CreateChannelDto} from "@app/chat/dto/createChannel.dto";
import {WSUser} from "@app/chat/decorator/webSocketUser.decorator";
import {UserEntity} from "@app/user/user.entity";
import {PrivateMessageDto} from "@app/chat/dto/privateMessage.dto";
import {UpdateChannelDto} from "@app/chat/dto/updateChannel.dto";
import {WebSocketExceptionFilter} from "@app/chat/filters/webSocketException.filter";
import {SanctionDto} from "@app/chat/dto/sanction.dto";
import {IsUserOnlineDto} from "@app/chat/dto/isUserOnline.dto";
import WebSocketRoleGuard from "@app/shared/guards/webSocketRole.guard";
import Role from "@app/user/types/role.enum";
import {banDto} from "@app/chat/dto/ban.dto";
import {ClientInfoService} from "@app/clientInfo/clientInfo.service";
import {Interval} from "@nestjs/schedule";
import {KickDto} from "@app/chat/dto/kick.dto";


@UseGuards(WebSocketRoleGuard(Role.User))
@UseFilters(new WebSocketExceptionFilter())
@UsePipes(new ValidationPipe({}))
@WebSocketGateway(3002, { cors: true })
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(
        private readonly chatService: ChatService,
        private readonly clientInfoService: ClientInfoService,
    ) {}

    private  logger: Logger = new Logger('ChatGateway');

    getSocket(socket) {
        if (socket)
            return socket[1];
        return null;
    }

    getSocketId(socket) {
        if (socket)
            return socket[0];
        return null;
    }

    getUser(socket) { // Use only id! User data is not updated
        if (!socket || !socket[1] || !socket[1]["handshake"])
            return null
        return socket[1]["handshake"]["headers"]["user"];
    }

    getUserId(socket) {
        if (this.getUser(socket))
            return this.getUser(socket)['id'];
        return null;
    }

    getAllSockets() {
        return [...this.server.sockets.sockets];
    }

    // @Interval(1000)
    // consoleLog() {
    //     console.log(this.getAllSockets().map(s => {
    //         const user = this.getUser(s);
    //         return {
    //             socketId: this.getSocketId(s),
    //             userId: user['id'],
    //             username: user["username"]
    //         };
    //     }));
    // }

    async afterInit(server: any): Promise<any> {
        this.logger.log('Chat Initialized');
        await this.chatService.createGeneralChannel();
    }

    async handleConnection(
        @ConnectedSocket() socket: Socket
    ) {
        const user = socket.handshake.headers.user;

        this.getAllSockets().forEach(s => {
            if (socket.id !== this.getSocketId(s) && user["id"] === this.getUserId(s)) {
                this.server.to(this.getSocketId(s)).emit('ban');
                this.getSocket(s).disconnect();                                                         // Last change
            }
        });

        // @ts-ignore
        //await this.chatService.addUserToChannelByName(user, 'general');
        socket.join('general');
        socket.emit('joined_channel', {"message": {"channel": "general"}});

        socket.join(user["id"].toString());
        socket.emit('joined_channel', {"message": {"channel": user["id"].toString()}});

        // @ts-ignore
        const channels = await this.chatService.getUserChannels(user["id"]);

        for (let ch of channels) {
            // @ts-ignore
            if (!await this.chatService.isBanned(user, ch)) {
                socket.join(ch.name)
            }
        }
    }


    handleDisconnect(
        @ConnectedSocket() socket: Socket
    ) {
        //const user = socket.handshake.headers.user;
    }


    @SubscribeMessage('send_message')
    async listenForMessage(
        @WSUser() user: UserEntity,
        @MessageBody() receiveMessageDto: ReceiveMessageDto
    ) {
        if (
            await this.chatService.isInChannel(user.id, receiveMessageDto.channel) &&
            !await this.chatService.isMuted(user.id, receiveMessageDto.channel)
        ) {
            this.server.to(receiveMessageDto.channel).emit('receive_message', {
                "message": {
                    userId: user.id,
                    channel: receiveMessageDto.channel,
                    username: user.username,
                    message: receiveMessageDto.message
                }
            })
        }
    }


    @SubscribeMessage('create_channel')
    async handleCreateChannel(
        @ConnectedSocket() socket: Socket,
        @WSUser() user: UserEntity,
        @MessageBody() createChannelDto: CreateChannelDto
    ) {
        const message = await this.chatService.createChannel(user.id, createChannelDto);
        socket.join(createChannelDto.name);
        socket.emit('created_channel', {message});
    }


    @SubscribeMessage('join_channel')
    async handleJoinChannel(
        @ConnectedSocket() socket: Socket,
        @WSUser() user: UserEntity,
        @MessageBody() joinChannelDto: JoinChannelDto
    ) {
        const message = await this.chatService.joinChannel(user.id, joinChannelDto, false);
        socket.join(joinChannelDto.name);
        socket.emit('joined_channel', {message});
    }


    @SubscribeMessage('update_channel')
    async handleUpdateChannel(
        @ConnectedSocket() socket: Socket,
        @WSUser() user: UserEntity,
        @MessageBody() updateChannelDto: UpdateChannelDto
    ) {
        const message = await this.chatService.updateChannel(user.id, updateChannelDto);
        socket.emit('updated_channel', message);
    }


    @SubscribeMessage('leave_channel')
    async handleLeaveChannel(
        @ConnectedSocket() socket: Socket,
        @WSUser() user: UserEntity,
        @MessageBody() leaveChannelDto: LeaveChannelDto
    ) {
        const message = await this.chatService.leaveChannel(user.id, leaveChannelDto);
        socket.to(leaveChannelDto.name).emit('left_channel', {message});
        socket.leave(leaveChannelDto.name);
    }


    @SubscribeMessage('send_private_message')
    async listenForPrivateMessage(
        @WSUser() user: UserEntity,
        @MessageBody() privateMessageDto: PrivateMessageDto
    ) {
        this.server.to(privateMessageDto.to).emit('receive_private_message', {
            "message": {
                userId: user.id,
                username: user.username,
                message: privateMessageDto.message
            }
        })
    }

    @SubscribeMessage('kick')
    async kickUser(
        @WSUser() user: UserEntity,
        @MessageBody() kickDto: KickDto
    ) {
        const channel = await this.chatService.getChannelByName(kickDto.channel);
        this.chatService.checkIfOperationAllowed(user.id, kickDto.userId, channel);

        const socket = this.getAllSockets().find(s => this.getUserId(s) === kickDto.userId);
        if (socket) {
            const socketId = socket[0];
            this.server.in(socketId).socketsLeave(kickDto.channel);
        }
        await this.chatService.removeUserFromChannel(kickDto.userId, kickDto.channel);
    }

    @SubscribeMessage('apply-sanction')
    async applySanction(
        @WSUser() user: UserEntity,
        @MessageBody() sanctionDto: SanctionDto
    ) {
        const channel = await this.chatService.getChannelByName(sanctionDto.channel);
        const sanction = await this.chatService.applySanctionOnUser(user.id, sanctionDto, channel);

        this.server.to(sanction.target.id.toString()).emit('sanction', {
            "sanction": {
                type: sanction.type,
                expiry: sanction.expiry_at,
                created: sanction.create_at
            }
        });

        if (sanction.type === "ban") {
            const socket = this.getAllSockets().find(s => this.getUserId(s) === sanction.target.id);
            if (socket) {
                const socketId = socket[0];
                this.server.in(socketId).socketsLeave(sanctionDto.channel);
            }
            await this.chatService.removeUserFromChannel(sanction.target.id, sanctionDto.channel);
        }
    }

    @SubscribeMessage('is-online')
    async isUserOnline(
        @MessageBody() isUserOnlineDto: IsUserOnlineDto
    ) {
        if (this.getAllSockets().find(s => this.getUserId(s) === +isUserOnlineDto.userId)) {
            this.server.emit('status', {
                "info": {
                    userId: isUserOnlineDto.userId,
                    status: true
                }
            });
        } else {
            this.server.emit('status', {
                "info": {
                    userId: +isUserOnlineDto.userId,
                    status: false
                }
            });
        }
    }

    @UseGuards(WebSocketRoleGuard(Role.Admin))
    @SubscribeMessage('admin_join_channel')
    async handleJoinChannelAsAdmin(
        @ConnectedSocket() socket: Socket,
        @WSUser() user: UserEntity,
        @MessageBody() joinChannelDto: JoinChannelDto
    ) {
        const message = await this.chatService.joinChannel(user.id, joinChannelDto, true);
        socket.join(joinChannelDto.name);
        socket.emit('joined_channel', {message});
    }

    @UseGuards(WebSocketRoleGuard(Role.Admin))
    @SubscribeMessage('ban')
    async handleBan(
        @MessageBody() banDto: banDto,
    ) {
        //await this.chatService.banUser(banDto.userId);
        this.server.to(banDto.userId.toString()).emit('ban');
    }

    @UseGuards(WebSocketRoleGuard(Role.User))
    @SubscribeMessage('channel-info')
    async getChannelInfo(
        @ConnectedSocket() socket: Socket,
        @MessageBody() channelDto: LeaveChannelDto,
    ) {
        const channel = await this.chatService.getChannelByName(channelDto.name);

        channel?.visitors.forEach(user => {
            if (this.getAllSockets().find(s => this.getUserId(s) === user.id)) {
                user.isOnline = true;
            } else {
                user.isOnline = false;
            }

            const room = this.clientInfoService.getUserRoom(user.id);
            if (room) {
                user.isInGame = true;
            } else {
                user.isInGame = false;
            }
        })
        socket.emit('channel-info-response', channel);
    }
}