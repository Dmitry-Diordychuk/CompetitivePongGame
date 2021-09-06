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
import {Logger, UseGuards, UsePipes} from "@nestjs/common";
import {JoinChannelDto} from "@app/chat/dto/joinChannel.dto";
import {ReceiveMessageDto} from "@app/chat/dto/receiveMessage.dto";
import {WebSocketValidationPipe} from "@app/shared/pipes/WebSocketValidation.pipe";
import {AuthGuard} from "@app/chat/guard/auth.guard";
import {LeaveChannelDto} from "@app/chat/dto/leaveChannel.dto";
import {CreateChannelDto} from "@app/chat/dto/createChannel.dto";

//@UseFilters(new WebSocketExceptionFilter())
@UseGuards(AuthGuard)
@UsePipes(new WebSocketValidationPipe())
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


    async handleConnection(@ConnectedSocket() socket: Socket) {
        const user = await this.chatService.authorize(socket);
        await this.chatService.addUserToChannelByName(user, 'general');
        socket.join('general');
        socket.emit('joined_channel', {"message": {"channel": "general"}});
    }


    handleDisconnect(client: any): any {
    }


    @SubscribeMessage('send_message')
    async listenForMessage(
        @ConnectedSocket() socket: Socket,
        @MessageBody() receiveMessageDto: ReceiveMessageDto
    ) {
        const user = this.chatService.authorize(socket);
        this.server.to(receiveMessageDto.channel).emit('receive_message', {
            "message": {
                ...user,
                message: receiveMessageDto.message
            }
        })
    }

    @SubscribeMessage('create_channel')
    async handleCreateChannel(
        @ConnectedSocket() socket: Socket,
        @MessageBody() createChannelDto: CreateChannelDto
    ) {
        const user = await this.chatService.authorize(socket);
        const message = await this.chatService.createChannel(user, createChannelDto);
        socket.join(createChannelDto.name);
        socket.emit('created_channel', {message});
    }

    @SubscribeMessage('join_channel')
    async handleJoinChannel(
        @ConnectedSocket() socket: Socket,
        @MessageBody() joinChannelDto: JoinChannelDto
    ) {
        const user = await this.chatService.authorize(socket);
        const message = await this.chatService.joinChannel(user, joinChannelDto);
        socket.join(joinChannelDto.name);
        socket.emit('joined_channel', {message});
    }


    @SubscribeMessage('leave_channel')
    async handleLeaveChannel(
        @ConnectedSocket() socket: Socket,
        @MessageBody() leaveChannelDto: LeaveChannelDto
    )
    {
        const message = await this.chatService.leaveChannel(socket, leaveChannelDto);
        socket.leave(leaveChannelDto.name);
        socket.emit('left_channel', {message});
    }
}