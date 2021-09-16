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
import {WebSocketAuthGuard} from "@app/chat/guard/webSocketAuth.guard";
import {LeaveChannelDto} from "@app/chat/dto/leaveChannel.dto";
import {CreateChannelDto} from "@app/chat/dto/createChannel.dto";
import {WSUser} from "@app/chat/decorator/webSocketUser.decorator";
import {UserEntity} from "@app/user/user.entity";
import {PrivateMessageDto} from "@app/chat/dto/privateMessage.dto";
import {UpdateChannelDto} from "@app/chat/dto/updateChannel.dto";
import {WebSocketExceptionFilter} from "@app/chat/filters/webSocketException.filter";

@UseFilters(new WebSocketExceptionFilter())
@UseGuards(WebSocketAuthGuard)
@UsePipes(new ValidationPipe())
@WebSocketGateway(3002)
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(private readonly chatService: ChatService) {}

    private  logger: Logger = new Logger('ChatGateway');

    async afterInit(server: any): Promise<any> {
        this.logger.log('Chat Initialized');
        await this.chatService.createGeneralChannel();
    }


    async handleConnection(
        @ConnectedSocket() socket: Socket
    ) {
        const user = socket.handshake.headers.user;

        // @ts-ignore
        await this.chatService.addUserToChannelByName(user, 'general');
        socket.join('general');
        socket.emit('joined_channel', {"message": {"channel": "general"}});

        // @ts-ignore
        socket.join(user.id.toString());
        // @ts-ignore
        socket.emit('joined_channel', {"message": {"channel": user.id.toString()}});
    }


    handleDisconnect(client: any): any {
    }


    @SubscribeMessage('send_message')
    async listenForMessage(
        @WSUser() user: UserEntity,
        @MessageBody() receiveMessageDto: ReceiveMessageDto
    ) {
        this.server.to(receiveMessageDto.channel).emit('receive_message', {
            "message": {
                username: user.username,
                message: receiveMessageDto.message
            }
        })
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
        const message = await this.chatService.joinChannel(user, joinChannelDto);
        socket.join(joinChannelDto.name);
        socket.to(joinChannelDto.name).emit('joined_channel', {message});
    }


    @SubscribeMessage('update_channel')
    async handleUpdateChannel(
        @ConnectedSocket() socket: Socket,
        @WSUser() user: UserEntity,
        @MessageBody() updateChannelDto: UpdateChannelDto
    ) {
        const message = await this.chatService.updateChannel(user, updateChannelDto);
        socket.to(updateChannelDto.name).emit('joined_channel', {message: ""});
    }


    @SubscribeMessage('leave_channel')
    async handleLeaveChannel(
        @ConnectedSocket() socket: Socket,
        @WSUser() user: UserEntity,
        @MessageBody() leaveChannelDto: LeaveChannelDto
    ) {
        const message = await this.chatService.leaveChannel(user, leaveChannelDto);
        socket.leave(leaveChannelDto.name);
        socket.to(leaveChannelDto.name).emit('left_channel', {message});
    }

    @SubscribeMessage('send_private_message')
    async listenForPrivateMessage(
        @WSUser() user: UserEntity,
        @MessageBody() privateMessageDto: PrivateMessageDto
    ) {
            this.server.to(privateMessageDto.to.toString()).emit('receive_private_message', {
            "message": {
                user_id: user.id,
                username: user.username,
                message: privateMessageDto.message
            }
        })
    }
}