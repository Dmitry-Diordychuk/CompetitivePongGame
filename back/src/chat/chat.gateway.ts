import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer
} from "@nestjs/websockets";
import {Server, Socket} from 'socket.io'
import {ChatService} from "@app/chat/chat.service";
import {Logger, UseFilters, UsePipes, ValidationPipe} from "@nestjs/common";
import {RoomHandleDto} from "@app/chat/dto/roomHandle.dto";
import {ReceiveMessageDto} from "@app/chat/dto/receiveMessage.dto";
import {WebSocketExceptionFilter} from "@app/chat/exception/webSocketException.filter";

@UseFilters(new WebSocketExceptionFilter())
@WebSocketGateway(3002)
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(private readonly chatService: ChatService) {}

    private  logger: Logger = new Logger('ChatGateway');

    afterInit(server: any): any {
        this.logger.log('Chat Initialized')
    }

    async handleConnection(@ConnectedSocket() socket: Socket) {
    }

    handleDisconnect(client: any): any {
    }

    @UsePipes(new ValidationPipe())
    @SubscribeMessage('send_message')
    async listenForMessage(
        @ConnectedSocket() socket: Socket,
        @MessageBody() receiveMessageDto: ReceiveMessageDto
    ) {
        const token = this.chatService.getToken(socket);
        const user = await this.chatService.getUserFromToken(token);
        this.server.to(receiveMessageDto.room_name).emit('receive_message', {
            token,
            username: user.username,
            message: receiveMessageDto.message
        })
    }

    @UsePipes(new ValidationPipe())
    @SubscribeMessage('join_room')
    handleJoinRoom(
        @ConnectedSocket() socket: Socket,
        @MessageBody() messageDto: RoomHandleDto
    )
    {
        socket.join(messageDto.name);
        socket.emit('joined_room', messageDto.name)
    }

    @UsePipes(new ValidationPipe())
    @SubscribeMessage('leave_room')
    handleLeaveRoom(
        @ConnectedSocket() socket: Socket,
        @MessageBody() messageDto: RoomHandleDto
    )
    {
        socket.leave(messageDto.name);
        socket.emit('left_room', messageDto.name)
    }
}