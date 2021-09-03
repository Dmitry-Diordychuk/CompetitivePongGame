import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer, WsException
} from "@nestjs/websockets";
import {Server, Socket} from 'socket.io'
import {ChatService} from "@app/chat/chat.service";
import {Logger, UseFilters, UseGuards, UsePipes} from "@nestjs/common";
import {JoinChannelDto} from "@app/chat/dto/joinChannel.dto";
import {ReceiveMessageDto} from "@app/chat/dto/receiveMessage.dto";
import {WebSocketExceptionFilter} from "@app/chat/filters/webSocketException.filter";
import {WebSocketValidationPipe} from "@app/shared/pipes/WebSocketValidation.pipe";
import {AuthGuard} from "@app/chat/guard/auth.guard";
import {LeaveChannelDto} from "@app/chat/dto/leaveChannel.dto";

@UseFilters(new WebSocketExceptionFilter())
@WebSocketGateway(3002)
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(private readonly chatService: ChatService) {}

    private  logger: Logger = new Logger('ChatGateway');

    afterInit(server: any): any {
        this.logger.log('Chat Initialized');
        const general = this.chatService.createGeneralChannel();
        if (!general)
            throw new WsException("Unexpected error during general channel creation");
    }

    @UseGuards(AuthGuard)
    async handleConnection(@ConnectedSocket() socket: Socket) {
    }

    handleDisconnect(client: any): any {
    }

    @UseGuards(AuthGuard)
    @UsePipes(new WebSocketValidationPipe())
    @SubscribeMessage('send_message')
    async listenForMessage(
        @ConnectedSocket() socket: Socket,
        @MessageBody() receiveMessageDto: ReceiveMessageDto
    ) {
        const token = this.chatService.getToken(socket);
        const user = await this.chatService.getUserFromToken(token);
        this.server.to(receiveMessageDto.channel).emit('receive_message', {
            token,
            username: user.username,
            message: receiveMessageDto.message
        })
    }

    @UseGuards(AuthGuard)
    @UsePipes(new WebSocketValidationPipe())
    @SubscribeMessage('join_channel')
    async handleJoinChannel(
        @ConnectedSocket() socket: Socket,
        @MessageBody() joinChannelDto: JoinChannelDto
    )
    {
        let channel = await this.chatService.findChannelByName(joinChannelDto.name);

        if (!channel) {
            channel = await this.chatService.createChannel(joinChannelDto);
        }

        if (await this.chatService.tryChannelPassword(channel, joinChannelDto.password)) {
            socket.join(channel.name);
            socket.emit('joined_channel', channel.name);
        } else {
            throw new WsException("Wrong password!");
        }
    }

    @UseGuards(AuthGuard)
    @UsePipes(new WebSocketValidationPipe())
    @SubscribeMessage('leave_channel')
    async handleLeaveChannel(
        @ConnectedSocket() socket: Socket,
        @MessageBody() leaveChannelDto: LeaveChannelDto
    )
    {
        socket.leave(leaveChannelDto.name);
        socket.emit('left_channel', leaveChannelDto.name)
    }
}