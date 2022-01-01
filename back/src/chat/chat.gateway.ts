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
import {Logger, UseFilters, UseGuards, UsePipes, ValidationPipe} from "@nestjs/common";
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

@UseFilters(new WebSocketExceptionFilter())
@UseGuards(WebSocketRoleGuard(Role.User))
@UsePipes(new ValidationPipe({}))
@WebSocketGateway(3002, { cors: true })
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;
    userIdSocketIdMap: Map<number, string>;
    usersOnlineId: number[];

    constructor(private readonly chatService: ChatService) {}

    private  logger: Logger = new Logger('ChatGateway');

    async afterInit(server: any): Promise<any> {
        this.userIdSocketIdMap = new Map();
        this.usersOnlineId = [];
        this.logger.log('Chat Initialized');
        await this.chatService.createGeneralChannel();
    }


    async handleConnection(
        @ConnectedSocket() socket: Socket
    ) {
        const user = socket.handshake.headers.user;

        this.userIdSocketIdMap.set(user["id"], socket.id);
        this.usersOnlineId.push(user["id"]);

        // @ts-ignore
        await this.chatService.addUserToChannelByName(user, 'general');
        socket.join('general');
        socket.emit('joined_channel', {"message": {"channel": "general"}});

        socket.join(user["id"].toString());
        socket.emit('joined_channel', {"message": {"channel": user["id"].toString()}});

        // @ts-ignore
        const channels = await this.chatService.getUserChannels(user);

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
        const user = socket.handshake.headers.user;
        this.userIdSocketIdMap.delete(user["id"]);
        this.usersOnlineId = this.usersOnlineId.filter(uid => uid !== user["id"]);
    }


    @SubscribeMessage('send_message')
    async listenForMessage(
        @WSUser() user: UserEntity,
        @MessageBody() receiveMessageDto: ReceiveMessageDto
    ) {
        if (
            await this.chatService.isInChannel(user, receiveMessageDto.channel) &&
            !await this.chatService.isMuted(user, receiveMessageDto.channel)
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
        const message = await this.chatService.createChannel(user, createChannelDto);
        socket.join(createChannelDto.name);
        socket.emit('created_channel', {message});
    }


    @SubscribeMessage('join_channel')
    async handleJoinChannel(
        @ConnectedSocket() socket: Socket,
        @WSUser() user: UserEntity,
        @MessageBody() joinChannelDto: JoinChannelDto
    ) {
        const message = await this.chatService.joinChannel(user, joinChannelDto, false);
        socket.join(joinChannelDto.name);
        socket.emit('joined_channel', {message});
    }


    @SubscribeMessage('update_channel')
    async handleUpdateChannel(
        @ConnectedSocket() socket: Socket,
        @WSUser() user: UserEntity,
        @MessageBody() updateChannelDto: UpdateChannelDto
    ) {
        const message = await this.chatService.updateChannel(user, updateChannelDto);
        socket.emit('updated_channel', message);
    }


    @SubscribeMessage('leave_channel')
    async handleLeaveChannel(
        @ConnectedSocket() socket: Socket,
        @WSUser() user: UserEntity,
        @MessageBody() leaveChannelDto: LeaveChannelDto
    ) {
        const message = await this.chatService.leaveChannel(user, leaveChannelDto);
        socket.to(leaveChannelDto.name).emit('left_channel', {message});
        socket.leave(leaveChannelDto.name);
    }


    @SubscribeMessage('send_private_message')
    async listenForPrivateMessage(
        @WSUser() user: UserEntity,
        @MessageBody() privateMessageDto: PrivateMessageDto
    ) {
        //const userId = await this.chatService.getUserIdByUsername(privateMessageDto.to);
        this.server.to(privateMessageDto.to).emit('receive_private_message', {
            "message": {
                userId: user.id,
                username: user.username,
                message: privateMessageDto.message
            }
        })
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
            const socketId = this.userIdSocketIdMap.get(sanction.target.id);
            this.server.in(socketId).socketsLeave(sanctionDto.channel);
            await this.chatService.removeUserFromChannel(sanction.target.id, sanctionDto.channel);
        }
    }

    @SubscribeMessage('is-online')
    async isUserOnline(
        @MessageBody() isUserOnlineDto: IsUserOnlineDto
    ) {
        if (this.usersOnlineId.find(uid => uid === +isUserOnlineDto.userId)) {
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

    @UseGuards(WebSocketRoleGuard(Role.PO))
    @SubscribeMessage('admin_join_channel')
    async handleJoinChannelAsAdmin(
        @ConnectedSocket() socket: Socket,
        @WSUser() user: UserEntity,
        @MessageBody() joinChannelDto: JoinChannelDto
    ) {
        const message = await this.chatService.joinChannel(user, joinChannelDto, true);
        socket.join(joinChannelDto.name);
        socket.emit('joined_channel', {message});
    }
}